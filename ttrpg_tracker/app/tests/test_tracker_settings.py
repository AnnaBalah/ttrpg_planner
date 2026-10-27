"""Tracker-owner preferences use disposable databases and never edit game records."""
from pathlib import Path
import sys
import tempfile
import unicodedata
import unittest

from fastapi import HTTPException
from pydantic import ValidationError
from sqlmodel import Session, SQLModel, create_engine, select

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import main


class TrackerSettingsTests(unittest.TestCase):
    def setUp(self):
        self.previous_engine = main.engine
        self.temp = tempfile.TemporaryDirectory(dir=Path(__file__).parent)
        self.database = Path(self.temp.name) / "settings.db"
        main.engine = create_engine(f"sqlite:///{self.database}")
        SQLModel.metadata.create_all(main.engine)
        with Session(main.engine) as db:
            system = main.System(name="Example System", color="#58b6a9")
            db.add(system)
            db.flush()
            db.add(main.Campaign(name="Future Campaign", default_gm="Campaign GM", system_id=system.id))
            db.add(main.GameSession(name="Past game", date="2024-01-01", gm="Rowan", system_id=system.id))
            db.add(main.GameSession(name="Current game", date="2026-01-01", gm="Mirá", system_id=system.id))
            db.commit()

    def tearDown(self):
        main.engine.dispose()
        main.engine = self.previous_engine
        self.temp.cleanup()

    def update(self, name):
        return main.update_tracker_settings(main.TrackerSettingsUpdate(owner_gm_name=name))

    def records(self):
        with Session(main.engine) as db:
            return main.export_payload(db)

    def test_default_is_unselected_and_reading_creates_no_preference(self):
        self.assertIsNone(main.read_tracker_settings().owner_gm_name)
        with Session(main.engine) as db:
            self.assertEqual(list(db.exec(select(main.TrackerSettings))), [])

    def test_names_from_other_years_and_campaign_defaults_are_accepted(self):
        before = self.records()
        self.assertEqual(self.update("rowan").owner_gm_name, "Rowan")
        self.assertEqual(self.update("Campaign GM").owner_gm_name, "Campaign GM")
        self.assertEqual(main.read_tracker_settings().owner_gm_name, "Campaign GM")
        self.assertEqual(self.records(), before)

    def test_unicode_case_and_whitespace_match_the_existing_name(self):
        name = unicodedata.normalize("NFD", "MIRÁ")
        self.assertEqual(self.update(f"  {name}  ").owner_gm_name, "Mirá")

    def test_invalid_choice_does_not_replace_the_saved_owner(self):
        self.update("Rowan")
        with self.assertRaises(HTTPException) as error:
            self.update("An unknown GM")
        self.assertEqual(error.exception.status_code, 422)
        for payload in [{}, {"owner_gm_name": " "}, {"owner_gm_name": 42}, {"owner_gm_name": "Rowan", "unexpected": True}]:
            with self.subTest(payload=payload), self.assertRaises(ValidationError):
                main.TrackerSettingsUpdate(**payload)
        self.assertEqual(main.read_tracker_settings().owner_gm_name, "Rowan")

    def test_clearing_the_choice_preserves_all_game_records(self):
        self.update("Rowan")
        before = self.records()
        self.assertIsNone(self.update(None).owner_gm_name)
        self.assertIsNone(main.read_tracker_settings().owner_gm_name)
        self.assertEqual(self.records(), before)

    def test_choice_survives_removed_sessions_and_database_reopening(self):
        self.update("Rowan")
        with Session(main.engine) as db:
            db.delete(db.exec(select(main.GameSession).where(main.GameSession.gm == "Rowan")).one())
            db.commit()
        before = self.records()
        main.engine.dispose()
        main.engine = create_engine(f"sqlite:///{self.database}")
        main.startup()
        self.assertEqual(main.read_tracker_settings().owner_gm_name, "Rowan")
        self.assertEqual(self.update(" ROWAN ").owner_gm_name, "Rowan")
        self.assertEqual(self.records(), before)


if __name__ == "__main__":
    unittest.main()
