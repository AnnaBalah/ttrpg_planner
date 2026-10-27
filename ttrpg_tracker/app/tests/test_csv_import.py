import csv
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import HTTPException
from sqlalchemy import event, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine, select

import main


COLUMNS = [
    "record_type", "id", "name", "date", "gm", "system_id", "system_name",
    "system_color", "campaign_id", "campaign_name", "default_gm", "default_link",
    "link", "notes", "archived", "created_at",
]


def as_csv(rows):
    output = io.StringIO(newline="")
    writer = csv.DictWriter(output, fieldnames=COLUMNS)
    writer.writeheader()
    writer.writerows(rows)
    return output.getvalue()


def existing_rows():
    return [
        {"record_type": "system", "id": "1", "name": "Existing System", "system_color": "#58b6a9"},
        {"record_type": "campaign", "id": "2", "name": "Existing Campaign", "system_id": "1", "system_name": "Existing System", "default_gm": "Anna", "default_link": "https://example.com/old", "archived": "1"},
        {"record_type": "session", "id": "3", "date": "2026-06-03", "gm": "Anna", "system_id": "1", "system_name": "Existing System", "campaign_id": "2", "campaign_name": "Existing Campaign", "link": "https://example.com/old", "notes": "Keep my notes"},
    ]


def new_rows():
    # These external IDs deliberately collide with IDs already in the database.
    return [
        {"record_type": "system", "id": "7", "name": "New System", "system_color": "#e58f55"},
        {"record_type": "campaign", "id": "12", "name": "Новий похід", "system_id": "7", "system_name": "New System", "default_gm": "Krzyś", "archived": "0"},
        {"record_type": "session", "id": "33", "date": "2026-10-25", "gm": "Krzyś", "system_id": "7", "system_name": "New System", "campaign_id": "12", "campaign_name": "Новий похід", "link": "https://example.com/new", "notes": 'First line, with a comma\nSecond line: "quoted"', "created_at": "2026-10-25T12:00:00+00:00"},
    ]


class CsvImportTests(unittest.TestCase):
    def setUp(self):
        self.old_engine, self.old_backup = main.engine, main.BACKUP_DIR
        self.temp = tempfile.TemporaryDirectory(dir=Path(__file__).parent)
        main.BACKUP_DIR = Path(self.temp.name) / "backups"
        main.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        event.listen(main.engine, "connect", main.enable_sqlite_foreign_keys)
        SQLModel.metadata.create_all(main.engine)
        with Session(main.engine) as db:
            db.add(main.System(id=7, name="Existing System", color="#58b6a9"))
            db.flush()
            db.add(main.Campaign(id=12, name="Existing Campaign", default_gm="Anna", system_id=7, default_link="https://example.com/old", archived=1))
            db.flush()
            db.add(main.GameSession(id=33, campaign_id=12, date="2026-06-03", gm="Anna", system_id=7, link="https://example.com/old", notes="Keep my notes"))
            db.commit()

    def tearDown(self):
        main.engine.dispose()
        main.engine, main.BACKUP_DIR = self.old_engine, self.old_backup
        self.temp.cleanup()

    def preview(self, data):
        return main.preview_csv_import(main.CsvImportRequest(csv_text=data))

    def apply(self, data, preview=None):
        preview = preview or self.preview(data)
        return main.apply_csv_import(main.CsvImportApply(csv_text=data, revision=preview["revision"]))

    def snapshot(self):
        with Session(main.engine) as db:
            return main.export_payload(db)

    def test_preview_is_read_only(self):
        before = self.snapshot()
        preview = self.preview(as_csv(existing_rows() + new_rows()))
        self.assertTrue(preview["can_import"])
        self.assertEqual(preview["counts"]["sessions"], {"new": 1, "existing": 0, "duplicates": 1})
        self.assertEqual(preview["counts"]["systems"]["new"], 1)
        self.assertEqual(preview["counts"]["campaigns"]["new"], 1)
        self.assertEqual(before, self.snapshot())
        self.assertFalse(main.BACKUP_DIR.exists())

    def test_append_maps_names_and_preserves_existing_settings(self):
        rows = existing_rows() + new_rows()
        rows[0]["system_color"] = "#ff6600"
        rows[1].update(default_gm="Other GM", archived="0", default_link="https://example.com/changed")
        rows[2].update(notes="Changed notes", link="https://example.com/changed")
        data = as_csv(rows)
        preview = self.preview(data)
        self.assertEqual(len(preview["warnings"]), 3)
        before = self.snapshot()
        result = self.apply(data, preview)
        after = self.snapshot()
        self.assertEqual(len(after["sessions"]), 2)
        self.assertEqual(next(item for item in after["systems"] if item["id"] == 7)["color"], "#58b6a9")
        old_campaign = next(item for item in after["campaigns"] if item["id"] == 12)
        self.assertEqual((old_campaign["default_gm"], old_campaign["archived"]), ("Anna", 1))
        self.assertEqual(next(item for item in after["sessions"] if item["id"] == 33)["notes"], "Keep my notes")
        new_session = next(item for item in after["sessions"] if item["id"] != 33)
        self.assertNotEqual(new_session["system_id"], 7)
        self.assertNotEqual(new_session["campaign_id"], 12)
        self.assertEqual(new_session["notes"], new_rows()[2]["notes"])
        self.assertEqual(new_session["created_at"], "2026-10-25T12:00:00+00:00")
        backup = json.loads((main.BACKUP_DIR / result["backup_file"]).read_text(encoding="utf-8"))
        self.assertEqual(backup, before)

    def test_repeated_import_adds_nothing(self):
        data = as_csv(existing_rows() + new_rows())
        self.apply(data)
        repeated = self.preview(data)
        self.assertFalse(repeated["can_import"])
        self.assertEqual(repeated["counts"]["sessions"]["new"], 0)
        result = self.apply(data, repeated)
        self.assertIsNone(result["backup_file"])
        self.assertEqual(len(self.snapshot()["sessions"]), 2)
        self.assertEqual(len(list(main.BACKUP_DIR.glob("*.json"))), 1)

    def test_old_preview_cannot_be_applied_twice(self):
        data = as_csv(existing_rows() + new_rows())
        preview = self.preview(data)
        self.apply(data, preview)
        with self.assertRaises(HTTPException) as caught:
            self.apply(data, preview)
        self.assertEqual(caught.exception.status_code, 409)
        self.assertEqual(len(self.snapshot()["sessions"]), 2)

    def test_stale_preview_rejects_an_unrelated_edit(self):
        data = as_csv(new_rows())
        preview = self.preview(data)
        with Session(main.engine) as db:
            item = db.get(main.GameSession, 33)
            item.notes = "An edit from another tab"
            db.add(item)
            db.commit()
        with self.assertRaises(HTTPException) as caught:
            self.apply(data, preview)
        self.assertEqual(caught.exception.status_code, 409)
        self.assertEqual(len(self.snapshot()["sessions"]), 1)

    def test_all_rows_validated_before_any_insert(self):
        rows = new_rows()
        rows[-1]["date"] = "2026-02-30"
        data = as_csv(rows)
        before = self.snapshot()
        preview = self.preview(data)
        self.assertTrue(preview["errors"])
        self.assertFalse(preview["can_import"])
        with self.assertRaises(HTTPException) as caught:
            self.apply(data, preview)
        self.assertEqual(caught.exception.status_code, 422)
        self.assertEqual(self.snapshot(), before)
        self.assertFalse(main.BACKUP_DIR.exists())

    def test_transaction_rolls_back_systems_and_campaigns_if_a_session_fails(self):
        with Session(main.engine) as db:
            db.exec(text("CREATE TRIGGER reject_new_session BEFORE INSERT ON sessions BEGIN SELECT RAISE(ABORT, 'test failure'); END"))
            db.commit()
        before = self.snapshot()
        with self.assertRaises(IntegrityError):
            self.apply(as_csv(new_rows()))
        self.assertEqual(self.snapshot(), before)

    def test_backup_failure_prevents_import(self):
        main.BACKUP_DIR.write_text("not a directory", encoding="utf-8")
        before = self.snapshot()
        with self.assertRaises(HTTPException) as caught:
            self.apply(as_csv(new_rows()))
        self.assertEqual(caught.exception.status_code, 503)
        self.assertEqual(self.snapshot(), before)

    def test_bom_unicode_and_quoted_newlines_round_trip(self):
        self.apply("\ufeff" + as_csv(new_rows()))
        data = main.export_csv().body.decode("utf-8")
        preview = self.preview(data)
        self.assertFalse(preview["errors"])
        self.assertEqual(preview["counts"]["sessions"]["new"], 0)
        self.assertFalse(preview["can_import"])

    def test_external_ids_work_when_definitions_follow_sessions(self):
        result = self.apply(as_csv(list(reversed(new_rows()))))
        self.assertEqual(result["counts"]["sessions"]["new"], 1)

    def test_full_csv_export_restores_an_empty_database(self):
        self.apply(as_csv(new_rows()))
        before = self.snapshot()
        data = main.export_csv().body.decode("utf-8")
        with Session(main.engine) as db:
            for table in ("sessions", "campaigns", "systems"):
                db.exec(text(f"DELETE FROM {table}"))
            db.commit()
        result = self.apply(data)
        self.assertEqual({kind: count["new"] for kind, count in result["counts"].items()}, {kind: len(rows) for kind, rows in before.items()})

        def semantic(payload):
            return {kind: sorted(
                ({key: value for key, value in row.items() if key not in {"id", "system_id", "campaign_id"}} for row in rows),
                key=lambda row: json.dumps(row, sort_keys=True),
            ) for kind, rows in payload.items()}

        self.assertEqual(semantic(self.snapshot()), semantic(before))
        self.assertFalse(self.preview(data)["can_import"])

    def test_distinct_same_day_sessions_are_preserved_by_multiplicity(self):
        rows = existing_rows()
        another = dict(rows[2], id="4")
        data = as_csv(rows + [another])
        preview = self.preview(data)
        self.assertEqual(preview["counts"]["sessions"]["new"], 1)
        self.apply(data, preview)
        self.assertEqual(len(self.snapshot()["sessions"]), 2)
        self.assertFalse(self.preview(data)["can_import"])

    def test_repeated_source_row_is_skipped(self):
        rows = new_rows()
        data = as_csv(rows + [dict(rows[-1])])
        preview = self.preview(data)
        self.assertEqual(preview["counts"]["sessions"]["new"], 1)
        self.assertEqual(preview["counts"]["sessions"]["duplicates"], 1)
        self.apply(data, preview)
        self.assertEqual(len(self.snapshot()["sessions"]), 2)

    def test_conflicting_source_id_is_invalid(self):
        rows = new_rows()
        rows.append(dict(rows[-1], date="2026-10-24"))
        preview = self.preview(as_csv(rows))
        self.assertTrue(preview["errors"])
        self.assertFalse(preview["can_import"])

    def test_one_shot_is_not_confused_with_a_campaign_session(self):
        row = dict(existing_rows()[2], id="99", name="Existing Campaign", campaign_name="", campaign_id="")
        data = as_csv(existing_rows()[:2] + [row])
        self.assertEqual(self.preview(data)["counts"]["sessions"]["new"], 1)
        self.apply(data)
        self.assertEqual(len(self.snapshot()["sessions"]), 2)

    def test_case_and_whitespace_match_existing_names(self):
        rows = existing_rows()
        rows[0]["name"] = " existing SYSTEM "
        rows[1]["name"] = "existing CAMPAIGN"
        rows[1]["system_name"] = "existing system"
        rows[2]["campaign_name"] = "EXISTING CAMPAIGN"
        rows[2]["system_name"] = "existing system"
        preview = self.preview(as_csv(rows))
        self.assertFalse(preview["errors"])
        self.assertFalse(preview["can_import"])

    def test_malformed_inputs_return_preview_errors(self):
        inputs = [
            "Name,Date,GM,System\nExample,2026-10-27,Anna,DnD\n",
            ",".join(COLUMNS) + "\n",
            ",".join(COLUMNS + ["name"]) + "\n",
            ",".join(COLUMNS) + "\nsystem,1,Truncated\n",
            ",".join(COLUMNS) + '\n"unterminated',
            as_csv([{"record_type": "unknown", "name": "Example"}]),
            as_csv([{**new_rows()[0], "system_color": "pink"}]),
            as_csv([{**new_rows()[1], "archived": "yes"}] + new_rows()[:1]),
            as_csv([{**new_rows()[2], "system_name": "Missing", "system_id": "999"}]),
            as_csv([{**new_rows()[2], "link": "javascript:alert(1)"}] + new_rows()[:2]),
        ]
        for data in inputs:
            with self.subTest(data=data[:60]):
                preview = self.preview(data)
                self.assertTrue(preview["errors"])
                self.assertFalse(preview["can_import"])


if __name__ == "__main__":
    unittest.main()
