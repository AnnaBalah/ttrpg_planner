"""HTTP regression checks against a disposable SQLite copy; no extra test dependencies."""
import csv
from concurrent.futures import ThreadPoolExecutor
import hashlib
import io
import json
import os
from pathlib import Path
import socket
import sqlite3
import subprocess
import sys
import tempfile
import time
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

APP = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(APP))


class ApiFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(dir=Path(__file__).parent)
        cls.directory = Path(cls.temp.name)
        cls.original_hash = hashlib.sha256((APP / "ttrpg.db").read_bytes()).hexdigest()
        source = sqlite3.connect(f"file:{(APP / 'ttrpg.db').as_posix()}?mode=ro", uri=True)
        target = sqlite3.connect(cls.directory / "test.db")
        source.backup(target)
        source.close()
        target.close()
        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            port = listener.getsockname()[1]
        cls.base = f"http://127.0.0.1:{port}"
        cls.process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", str(port)],
            cwd=APP, env={**os.environ, "TTRPG_DB_PATH": str(cls.directory / "test.db"), "TTRPG_BACKUP_DIR": str(cls.directory / "backups")},
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
        )
        for _ in range(100):
            try:
                if cls.request("GET", "/api/health")[0] == 200:
                    break
            except OSError:
                time.sleep(0.05)
        else:
            cls.process.terminate()
            cls.process.wait(timeout=10)
            cls.temp.cleanup()
            raise RuntimeError("Isolated API test server did not start")

    @classmethod
    def tearDownClass(cls):
        if os.name == "nt":
            subprocess.run(["taskkill", "/PID", str(cls.process.pid), "/T", "/F"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        else:
            cls.process.terminate()
        cls.process.wait(timeout=10)
        cls.temp.cleanup()
        assert hashlib.sha256((APP / "ttrpg.db").read_bytes()).hexdigest() == cls.original_hash, "Tests changed the real database"

    @classmethod
    def request(cls, method, path, payload=None):
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        request = Request(cls.base + path, data=data, method=method, headers={"Content-Type": "application/json"} if data else {})
        try:
            response = urlopen(request, timeout=10)
        except HTTPError as error:
            response = error
        with response:
            content = response.read().decode("utf-8")
            try:
                content = json.loads(content)
            except ValueError:
                pass
            return response.status, content, {key.lower(): value for key, value in response.headers.items()}

    def setUp(self):
        self.name = "QA " + self._testMethodName
        status, self.system, _ = self.request("POST", "/api/systems", {"name": self.name, "color": "#58b6a9"})
        self.assertEqual(status, 201)

    def campaign(self, **overrides):
        return {"name": self.name, "default_gm": "Anna", "system_id": self.system["id"], "default_link": "https://example.com/campaign", **overrides}

    def session(self, **overrides):
        return {"name": self.name, "date": "2026-10-27", "gm": "Anna", "system_id": self.system["id"], **overrides}

    def test_session_create_edit_clear_reload_and_delete(self):
        status, item, _ = self.request("POST", "/api/sessions", self.session(notes='Unicode: похід, "notes"\nSecond line', link="https://example.com/game"))
        self.assertEqual(status, 201)
        status, edited, _ = self.request("PUT", f"/api/sessions/{item['id']}", {"notes": None, "link": None, "date": "2024-02-29"})
        self.assertEqual(status, 200)
        self.assertEqual(edited["created_at"], item["created_at"])
        self.assertIsNone(edited["notes"])
        self.assertIsNone(edited["link"])
        self.assertEqual(next(s for s in self.request("GET", "/api/sessions")[1] if s["id"] == item["id"])["date"], "2024-02-29")
        self.assertEqual(self.request("DELETE", f"/api/sessions/{item['id']}")[0], 204)
        self.assertEqual(self.request("DELETE", f"/api/sessions/{item['id']}")[0], 404)

    def test_campaign_defaults_and_delete_protection(self):
        status, campaign, _ = self.request("POST", "/api/campaigns", self.campaign())
        self.assertEqual(status, 201)
        status, item, _ = self.request("POST", "/api/sessions", {"campaign_id": campaign["id"], "date": "2026-10-27"})
        self.assertEqual(status, 201)
        self.assertEqual((item["gm"], item["system_id"], item["name"]), ("Anna", self.system["id"], None))
        self.assertEqual(self.request("DELETE", f"/api/campaigns/{campaign['id']}")[0], 409)
        self.assertEqual(self.request("PUT", f"/api/campaigns/{campaign['id']}", {"archived": 1})[0], 200)
        active = self.request("GET", "/api/campaigns?include_archived=false")[1]
        self.assertNotIn(campaign["id"], [c["id"] for c in active])
        self.request("DELETE", f"/api/sessions/{item['id']}")
        self.assertEqual(self.request("DELETE", f"/api/campaigns/{campaign['id']}")[0], 204)

    def test_session_kind_can_change_both_ways(self):
        campaign = self.request("POST", "/api/campaigns", self.campaign())[1]
        item = self.request("POST", "/api/sessions", self.session())[1]
        status, item, _ = self.request("PUT", f"/api/sessions/{item['id']}", {"campaign_id": campaign["id"]})
        self.assertEqual(status, 200)
        self.assertIsNone(item["name"])
        status, item, _ = self.request("PUT", f"/api/sessions/{item['id']}", {"campaign_id": None, "name": "One-shot again"})
        self.assertEqual(status, 200)
        self.assertEqual(item["display_name"], "One-shot again")

    def test_blank_required_values_rejected(self):
        for path, payload in [
            ("/api/systems", {"name": "   ", "color": "#58b6a9"}),
            ("/api/campaigns", self.campaign(name="  ")),
            ("/api/campaigns", self.campaign(default_gm="  ")),
            ("/api/sessions", self.session(name="  ")),
            ("/api/sessions", self.session(gm="  ")),
        ]:
            with self.subTest(path=path, payload=payload):
                self.assertEqual(self.request("POST", path, payload)[0], 422)

    def test_names_are_trimmed_and_case_insensitive_duplicates_rejected(self):
        for name in [self.name, " " + self.name + " ", self.name.upper()]:
            with self.subTest(name=name):
                self.assertEqual(self.request("POST", "/api/systems", {"name": name, "color": "#58b6a9"})[0], 409)
        status, item, _ = self.request("POST", "/api/campaigns", self.campaign(name=" " + self.name + " "))
        self.assertEqual(status, 201)
        self.assertEqual(item["name"], self.name)
        self.assertEqual(self.request("POST", "/api/campaigns", self.campaign(name=self.name.upper()))[0], 409)

    def test_invalid_colors_and_archive_status_rejected(self):
        self.assertEqual(self.request("POST", "/api/systems", {"name": self.name + " invalid", "color": "red"})[0], 422)
        self.assertEqual(self.request("POST", "/api/campaigns", self.campaign(archived=2))[0], 422)
        self.assertEqual(self.request("PUT", f"/api/systems/{self.system['id']}", {"color": "#zzzzzz"})[0], 422)

    def test_duplicate_name_updates_are_rejected(self):
        other = self.request("POST", "/api/systems", {"name": self.name + " other", "color": "#e58f55"})[1]
        self.assertEqual(self.request("PUT", f"/api/systems/{other['id']}", {"name": self.name.upper()})[0], 409)
        first = self.request("POST", "/api/campaigns", self.campaign())[1]
        other = self.request("POST", "/api/campaigns", self.campaign(name=self.name + " other"))[1]
        self.assertEqual(self.request("PUT", f"/api/campaigns/{other['id']}", {"name": first['name'].upper()})[0], 409)

    def test_concurrent_duplicate_creates_do_not_add_ambiguous_names(self):
        for index in range(3):
            name = f"{self.name} concurrent {index}"
            with ThreadPoolExecutor(max_workers=4) as pool:
                results = list(pool.map(lambda candidate: self.request("POST", "/api/systems", {"name": candidate, "color": "#58b6a9"})[0], [name, name.upper(), name.lower(), " " + name + " "]))
            self.assertEqual(sorted(results), [201, 409, 409, 409])

    def test_invalid_links_rejected_for_round_trip_consistency(self):
        for link in ["javascript:alert(1)", "ftp://example.com/game", "https://", "https://example.com/\npath"]:
            with self.subTest(link=link):
                self.assertEqual(self.request("POST", "/api/sessions", self.session(link=link))[0], 422)
                self.assertEqual(self.request("POST", "/api/campaigns", self.campaign(default_link=link))[0], 422)

    def test_null_required_updates_are_validation_errors(self):
        campaign = self.request("POST", "/api/campaigns", self.campaign())[1]
        item = self.request("POST", "/api/sessions", self.session())[1]
        for path, fields in [
            (f"/api/systems/{self.system['id']}", ["name", "color"]),
            (f"/api/campaigns/{campaign['id']}", ["name", "default_gm", "system_id", "archived"]),
            (f"/api/sessions/{item['id']}", ["date"]),
        ]:
            for field in fields:
                with self.subTest(path=path, field=field):
                    self.assertEqual(self.request("PUT", path, {field: None})[0], 422)

    def test_invalid_dates_and_unknown_references_add_nothing(self):
        before = len(self.request("GET", "/api/sessions")[1])
        for date in ["2026-02-29", "2026-13-01", "tomorrow", ""]:
            self.assertEqual(self.request("POST", "/api/sessions", self.session(date=date))[0], 422)
        self.assertEqual(self.request("POST", "/api/sessions", self.session(system_id=999999))[0], 404)
        self.assertEqual(self.request("POST", "/api/sessions", self.session(campaign_id=999999))[0], 404)
        self.assertEqual(len(self.request("GET", "/api/sessions")[1]), before)

    def test_dates_are_stored_in_canonical_format(self):
        status, item, _ = self.request("POST", "/api/sessions", self.session(date="20261027"))
        self.assertEqual(status, 201)
        self.assertEqual(item["date"], "2026-10-27")

    def test_tracker_owner_settings_are_shared_validated_and_preserve_records(self):
        previous = self.request("GET", "/api/settings")[1]
        owner = self.name + " GM"
        self.request("POST", "/api/sessions", self.session(gm=owner, date="2024-01-01"))
        before = self.request("GET", "/api/export")[1]
        try:
            status, settings, _ = self.request("PUT", "/api/settings", {"owner_gm_name": "  " + owner.upper() + "  "})
            self.assertEqual(status, 200)
            self.assertEqual(settings, {"owner_gm_name": owner})
            self.assertEqual(self.request("GET", "/api/settings")[1], settings)
            for payload in [{}, {"owner_gm_name": " "}, {"owner_gm_name": "Unknown QA GM"}]:
                with self.subTest(payload=payload):
                    self.assertEqual(self.request("PUT", "/api/settings", payload)[0], 422)
            self.assertEqual(self.request("GET", "/api/settings")[1], settings)
            self.assertEqual(self.request("GET", "/api/export")[1], before)
            self.assertEqual(self.request("PUT", "/api/settings", {"owner_gm_name": None})[1], {"owner_gm_name": None})
        finally:
            self.assertEqual(self.request("PUT", "/api/settings", previous)[0], 200)

    def test_exports_are_complete_and_csv_reimport_is_a_no_op(self):
        self.request("POST", "/api/sessions", self.session(notes='Кома, "quoted"\nNext line'))
        status, exported, _ = self.request("GET", "/api/export")
        self.assertEqual(status, 200)
        status, data, headers = self.request("GET", "/api/export.csv")
        self.assertEqual(status, 200)
        self.assertIn("ttrpg-export.csv", headers["content-disposition"])
        rows = list(csv.DictReader(io.StringIO(data)))
        self.assertEqual(len(rows), sum(len(items) for items in exported.values()))
        status, preview, _ = self.request("POST", "/api/import/preview", {"csv_text": data})
        self.assertEqual(status, 200)
        self.assertFalse(preview["errors"])
        self.assertFalse(preview["can_import"])
        self.assertTrue(all(counts["new"] == 0 for counts in preview["counts"].values()))


class StartupTests(unittest.TestCase):
    def test_deleting_all_sessions_does_not_restore_seed_data_at_restart(self):
        from sqlalchemy.pool import StaticPool
        from sqlmodel import Session, SQLModel, create_engine, select
        import main
        previous = main.engine
        main.engine = create_engine("sqlite://", poolclass=StaticPool)
        try:
            SQLModel.metadata.create_all(main.engine)
            with Session(main.engine) as db:
                db.add(main.System(name="Keep my empty tracker", color="#58b6a9"))
                db.commit()
            main.startup()
            with Session(main.engine) as db:
                self.assertEqual(len(list(db.exec(select(main.GameSession)))), 0)
        finally:
            main.engine.dispose()
            main.engine = previous


if __name__ == "__main__":
    unittest.main()
