from __future__ import annotations

import csv
import hashlib
import io
import json
import os
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Annotated, Optional
from urllib.parse import urlsplit

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import AfterValidator, BaseModel, ConfigDict, field_validator
from sqlalchemy import CheckConstraint, UniqueConstraint, event, text
from sqlmodel import Field, Session, SQLModel, create_engine, select


APP_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = APP_DIR / "frontend"
IMPORT_CSV = APP_DIR / "import_source" / "notion_sessions_all.csv"
DB_PATH = Path(os.getenv("TTRPG_DB_PATH", APP_DIR / "ttrpg.db"))
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
BACKUP_DIR = Path(os.getenv("TTRPG_BACKUP_DIR", APP_DIR / "backups"))

engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
)


@event.listens_for(engine, "connect")
def enable_sqlite_foreign_keys(dbapi_connection, _connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


class System(SQLModel, table=True):
    __tablename__ = "systems"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    color: str
    created_at: str = Field(default_factory=utc_now)


class Campaign(SQLModel, table=True):
    __tablename__ = "campaigns"
    __table_args__ = (UniqueConstraint("name", name="uq_campaign_name"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    default_gm: str
    system_id: int = Field(foreign_key="systems.id", index=True)
    default_link: Optional[str] = None
    archived: int = 0
    created_at: str = Field(default_factory=utc_now)


class GameSession(SQLModel, table=True):
    __tablename__ = "sessions"
    __table_args__ = (
        CheckConstraint(
            "campaign_id IS NOT NULL OR name IS NOT NULL",
            name="ck_session_campaign_or_name",
        ),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    campaign_id: Optional[int] = Field(default=None, foreign_key="campaigns.id", index=True)
    name: Optional[str] = None
    date: str = Field(index=True)
    gm: str
    system_id: int = Field(foreign_key="systems.id", index=True)
    link: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=utc_now)


def required_text(value: str) -> str:
    value = unicodedata.normalize("NFC", value).strip()
    if not value:
        raise ValueError("This field cannot be blank")
    return value


def hex_color(value: str) -> str:
    value = value.strip()
    if not re.fullmatch(r"#[0-9a-fA-F]{6}", value):
        raise ValueError("Color must use six hexadecimal digits, such as #58b6a9")
    return value


def web_link(value: str | None) -> str | None:
    if value is None or not value.strip():
        return None
    value = value.strip()
    parts = urlsplit(value)
    if parts.scheme.lower() not in {"http", "https"} or not parts.hostname or any(ord(c) < 32 for c in value):
        raise ValueError("Links must be complete http:// or https:// addresses")
    return value


RequiredText = Annotated[str, AfterValidator(required_text)]
HexColor = Annotated[str, AfterValidator(hex_color)]
WebLink = Annotated[Optional[str], AfterValidator(web_link)]


class SystemCreate(BaseModel):
    name: RequiredText
    color: HexColor


class SystemUpdate(BaseModel):
    name: Optional[RequiredText] = None
    color: Optional[HexColor] = None

    @field_validator("name", "color", mode="before")
    @classmethod
    def not_null(cls, value):
        if value is None:
            raise ValueError("This field cannot be null")
        return value


class SystemRead(SystemCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: str


class CampaignCreate(BaseModel):
    name: RequiredText
    default_gm: RequiredText
    system_id: int
    default_link: WebLink = None
    archived: int = Field(default=0, ge=0, le=1)


class CampaignUpdate(BaseModel):
    name: Optional[RequiredText] = None
    default_gm: Optional[RequiredText] = None
    system_id: Optional[int] = None
    default_link: WebLink = None
    archived: Optional[int] = Field(default=None, ge=0, le=1)

    @field_validator("name", "default_gm", "system_id", "archived", mode="before")
    @classmethod
    def not_null(cls, value):
        if value is None:
            raise ValueError("This field cannot be null")
        return value


class CampaignRead(CampaignCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: str
    system_name: str
    system_color: str


class SessionCreate(BaseModel):
    campaign_id: Optional[int] = None
    name: Optional[str] = None
    date: str
    gm: Optional[RequiredText] = None
    system_id: Optional[int] = None
    link: WebLink = None
    notes: Optional[str] = None

    @field_validator("date")
    @classmethod
    def valid_iso_date(cls, value: str) -> str:
        return date.fromisoformat(value).isoformat()


class SessionUpdate(BaseModel):
    campaign_id: Optional[int] = None
    name: Optional[str] = None
    date: Optional[str] = None
    gm: Optional[RequiredText] = None
    system_id: Optional[int] = None
    link: WebLink = None
    notes: Optional[str] = None

    @field_validator("date")
    @classmethod
    def valid_iso_date(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            raise ValueError("Date cannot be null")
        return date.fromisoformat(value).isoformat()


class CsvImportRequest(BaseModel):
    csv_text: str = Field(min_length=1, max_length=5_000_000)


class CsvImportApply(CsvImportRequest):
    revision: str = Field(min_length=64, max_length=64)


class SessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    campaign_id: Optional[int]
    campaign_name: Optional[str]
    name: Optional[str]
    display_name: str
    date: str
    gm: str
    system_id: int
    system_name: str
    system_color: str
    link: Optional[str]
    notes: Optional[str]
    created_at: str


app = FastAPI(title="TTRPG Tracker")
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


@app.on_event("startup")
def startup() -> None:
    SQLModel.metadata.create_all(engine)
    with Session(engine) as db:
        has_data = any(db.exec(select(model.id)).first() is not None for model in (System, Campaign, GameSession))
        if not has_data and IMPORT_CSV.exists():
            import_seed_data(db, IMPORT_CSV)


@app.get("/")
def index() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/systems", response_model=list[SystemRead])
def list_systems() -> list[System]:
    with Session(engine) as db:
        return list(db.exec(select(System).order_by(System.name)))


@app.post("/api/systems", response_model=SystemRead, status_code=201)
def create_system(payload: SystemCreate) -> System:
    with Session(engine) as db:
        db.exec(text("BEGIN IMMEDIATE"))
        ensure_unique_name(db, System, payload.name)
        system = System(name=payload.name.strip(), color=payload.color.strip())
        db.add(system)
        db.commit()
        db.refresh(system)
        return system


@app.put("/api/systems/{system_id}", response_model=SystemRead)
def update_system(system_id: int, payload: SystemUpdate) -> System:
    with Session(engine) as db:
        db.exec(text("BEGIN IMMEDIATE"))
        system = require_system(db, system_id)
        updates = payload.model_dump(exclude_unset=True)
        if "name" in updates:
            ensure_unique_name(db, System, updates["name"], system_id)
        for key, value in updates.items():
            if isinstance(value, str):
                value = value.strip()
            setattr(system, key, value)
        db.add(system)
        db.commit()
        db.refresh(system)
        return system


@app.get("/api/campaigns", response_model=list[CampaignRead])
def list_campaigns(
    include_archived: bool = Query(default=True),
) -> list[CampaignRead]:
    with Session(engine) as db:
        query = select(Campaign)
        if not include_archived:
            query = query.where(Campaign.archived == 0)
        campaigns = list(db.exec(query.order_by(Campaign.name)))
        systems = system_map(db)
        return [campaign_read(campaign, systems[campaign.system_id]) for campaign in campaigns]


@app.post("/api/campaigns", response_model=CampaignRead, status_code=201)
def create_campaign(payload: CampaignCreate) -> CampaignRead:
    with Session(engine) as db:
        db.exec(text("BEGIN IMMEDIATE"))
        require_system(db, payload.system_id)
        ensure_unique_name(db, Campaign, payload.name)
        campaign = Campaign(**payload.model_dump())
        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        systems = system_map(db)
        return campaign_read(campaign, systems[campaign.system_id])


@app.put("/api/campaigns/{campaign_id}", response_model=CampaignRead)
def update_campaign(campaign_id: int, payload: CampaignUpdate) -> CampaignRead:
    with Session(engine) as db:
        db.exec(text("BEGIN IMMEDIATE"))
        campaign = require_campaign(db, campaign_id)
        updates = payload.model_dump(exclude_unset=True)
        if "system_id" in updates:
            require_system(db, updates["system_id"])
        if "name" in updates:
            ensure_unique_name(db, Campaign, updates["name"], campaign_id)
        for key, value in updates.items():
            setattr(campaign, key, value)
        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        systems = system_map(db)
        return campaign_read(campaign, systems[campaign.system_id])


@app.delete("/api/campaigns/{campaign_id}", status_code=204)
def delete_campaign(campaign_id: int) -> None:
    with Session(engine) as db:
        campaign = require_campaign(db, campaign_id)
        has_sessions = db.exec(
            select(GameSession.id).where(GameSession.campaign_id == campaign_id)
        ).first()
        if has_sessions:
            raise HTTPException(
                status_code=409,
                detail="Campaign has sessions; archive it instead of deleting",
            )
        db.delete(campaign)
        db.commit()


@app.get("/api/sessions", response_model=list[SessionRead])
def list_sessions() -> list[SessionRead]:
    with Session(engine) as db:
        sessions = list(db.exec(select(GameSession).order_by(GameSession.date.desc())))
        campaigns = campaign_map(db)
        systems = system_map(db)
        return [session_read(item, campaigns, systems) for item in sessions]


@app.post("/api/sessions", response_model=SessionRead, status_code=201)
def create_session(payload: SessionCreate) -> SessionRead:
    with Session(engine) as db:
        item = build_session(db, payload)
        db.add(item)
        db.commit()
        db.refresh(item)
        return session_read(item, campaign_map(db), system_map(db))


@app.put("/api/sessions/{session_id}", response_model=SessionRead)
def update_session(session_id: int, payload: SessionUpdate) -> SessionRead:
    with Session(engine) as db:
        item = db.get(GameSession, session_id)
        if not item:
            raise HTTPException(status_code=404, detail="Session not found")
        updates = payload.model_dump(exclude_unset=True)
        merged_data = {
            "campaign_id": item.campaign_id,
            "name": item.name,
            "date": item.date,
            "gm": item.gm,
            "system_id": item.system_id,
            "link": item.link,
            "notes": item.notes,
        }
        merged_data.update(updates)
        merged = SessionCreate(**merged_data)
        replacement = build_session(db, merged)
        for key, value in replacement.model_dump(exclude={"id", "created_at"}).items():
            setattr(item, key, value)
        db.add(item)
        db.commit()
        db.refresh(item)
        return session_read(item, campaign_map(db), system_map(db))


@app.delete("/api/sessions/{session_id}", status_code=204)
def delete_session(session_id: int) -> None:
    with Session(engine) as db:
        item = db.get(GameSession, session_id)
        if not item:
            raise HTTPException(status_code=404, detail="Session not found")
        db.delete(item)
        db.commit()


@app.get("/api/export")
def export_json() -> dict[str, list[dict]]:
    with Session(engine) as db:
        return export_payload(db)


@app.post("/api/import/preview")
def preview_csv_import(payload: CsvImportRequest) -> dict:
    with Session(engine) as db:
        db.exec(text("BEGIN"))
        plan = plan_csv_import(db, payload.csv_text)
        return import_preview(plan, import_revision(db, payload.csv_text))


@app.post("/api/import")
def apply_csv_import(payload: CsvImportApply) -> dict:
    with Session(engine) as db:
        # Lock before checking the preview so two imports cannot race each other.
        db.exec(text("BEGIN IMMEDIATE"))
        if payload.revision != import_revision(db, payload.csv_text):
            raise HTTPException(status_code=409, detail="Your data changed since the preview. Preview the file again.")
        plan = plan_csv_import(db, payload.csv_text)
        if plan["errors"]:
            raise HTTPException(status_code=422, detail="The CSV has invalid rows. Fix them and preview the file again.")
        counts = import_counts(plan)
        backup_file = None
        if any(items["new"] for items in counts.values()):
            backup_file = save_import_backup(db)
        systems = {import_name(item.name): item for item in db.exec(select(System))}
        for values in plan["systems"]:
            item = System(**values)
            db.add(item)
            systems[import_name(item.name)] = item
        db.flush()
        campaigns = {import_name(item.name): item for item in db.exec(select(Campaign))}
        for values in plan["campaigns"]:
            values = dict(values)
            system_key = values.pop("system_key")
            item = Campaign(system_id=systems[system_key].id, **values)
            db.add(item)
            campaigns[import_name(item.name)] = item
        db.flush()
        for values in plan["sessions"]:
            values = dict(values)
            system_key = values.pop("system_key")
            campaign_key = values.pop("campaign_key")
            db.add(GameSession(
                system_id=systems[system_key].id,
                campaign_id=campaigns[campaign_key].id if campaign_key else None,
                **values,
            ))
        db.commit()
        return {"counts": counts, "backup_file": backup_file}


@app.get("/api/export.csv")
def export_csv() -> Response:
    with Session(engine) as db:
        payload = export_payload(db)

    buffer = io.StringIO()
    writer = csv.DictWriter(
        buffer,
        fieldnames=[
            "record_type",
            "id",
            "name",
            "date",
            "gm",
            "system_id",
            "system_name",
            "system_color",
            "campaign_id",
            "campaign_name",
            "default_gm",
            "default_link",
            "link",
            "notes",
            "archived",
            "created_at",
        ],
        extrasaction="ignore",
    )
    writer.writeheader()
    for system in payload["systems"]:
        writer.writerow(
            {
                "record_type": "system",
                "id": system["id"],
                "name": system["name"],
                "system_color": system["color"],
                "created_at": system["created_at"],
            }
        )
    for campaign in payload["campaigns"]:
        writer.writerow(
            {
                "record_type": "campaign",
                **campaign,
                "system_name": campaign["system_name"],
                "system_color": campaign["system_color"],
            }
        )
    for item in payload["sessions"]:
        writer.writerow({"record_type": "session", **item})

    return Response(
        content=buffer.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="ttrpg-export.csv"'},
    )


def build_session(db: Session, payload: SessionCreate) -> GameSession:
    campaign = None
    name = clean_optional(payload.name)
    gm = clean_optional(payload.gm)
    system_id = payload.system_id

    if payload.campaign_id is not None:
        campaign = require_campaign(db, payload.campaign_id)
        gm = gm or campaign.default_gm
        system_id = system_id or campaign.system_id
        name = None
    elif not name:
        raise HTTPException(status_code=422, detail="One-shot sessions need a name")

    if system_id is None:
        raise HTTPException(status_code=422, detail="A system is required")
    require_system(db, system_id)
    if not gm:
        raise HTTPException(status_code=422, detail="A GM is required")

    return GameSession(
        campaign_id=campaign.id if campaign else None,
        name=name,
        date=payload.date,
        gm=gm,
        system_id=system_id,
        link=clean_optional(payload.link),
        notes=clean_optional(payload.notes),
    )


def require_campaign(db: Session, campaign_id: int) -> Campaign:
    campaign = db.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


def ensure_unique_name(db: Session, model, name: str, current_id: int | None = None) -> None:
    if any(item.id != current_id and import_name(item.name) == import_name(name) for item in db.exec(select(model))):
        raise HTTPException(status_code=409, detail=f"{model.__name__} name already exists")


def require_system(db: Session, system_id: int) -> System:
    system = db.get(System, system_id)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    return system


def system_map(db: Session) -> dict[int, System]:
    return {item.id: item for item in db.exec(select(System)) if item.id is not None}


def campaign_map(db: Session) -> dict[int, Campaign]:
    return {item.id: item for item in db.exec(select(Campaign)) if item.id is not None}


def campaign_read(campaign: Campaign, system: System) -> CampaignRead:
    return CampaignRead(
        **campaign.model_dump(),
        system_name=system.name,
        system_color=system.color,
    )


def session_read(
    item: GameSession,
    campaigns: dict[int, Campaign],
    systems: dict[int, System],
) -> SessionRead:
    campaign = campaigns.get(item.campaign_id) if item.campaign_id else None
    system = systems[item.system_id]
    display_name = campaign.name if campaign else item.name or "One-shot"
    return SessionRead(
        **item.model_dump(),
        campaign_name=campaign.name if campaign else None,
        display_name=display_name,
        system_name=system.name,
        system_color=system.color,
    )


def export_payload(db: Session) -> dict[str, list[dict]]:
    systems = system_map(db)
    campaigns = campaign_map(db)
    return {
        "systems": [
            item.model_dump()
            for item in db.exec(select(System).order_by(System.name))
        ],
        "campaigns": [
            campaign_read(item, systems[item.system_id]).model_dump()
            for item in db.exec(select(Campaign).order_by(Campaign.name))
        ],
        "sessions": [
            session_read(item, campaigns, systems).model_dump()
            for item in db.exec(select(GameSession).order_by(GameSession.date.desc()))
        ],
    }


def import_name(value: str) -> str:
    return unicodedata.normalize("NFC", value).strip().casefold()


def import_counts(plan: dict) -> dict:
    return {
        plural: {
            "new": len(plan[plural]),
            "existing": sum(row["status"] == "existing" for row in plan["rows"] if row["record_type"] == kind),
            "duplicates": sum(row["status"] == "duplicate" for row in plan["rows"] if row["record_type"] == kind),
        }
        for kind, plural in [("system", "systems"), ("campaign", "campaigns"), ("session", "sessions")]
    }


def import_preview(plan: dict, revision: str) -> dict:
    counts = import_counts(plan)
    return {
        "revision": revision,
        "can_import": not plan["errors"] and any(items["new"] for items in counts.values()),
        "counts": counts,
        "rows": plan["rows"],
        "errors": plan["errors"],
        "warnings": plan["warnings"],
    }


def import_revision(db: Session, csv_text: str) -> str:
    snapshot = {
        "systems": [item.model_dump() for item in db.exec(select(System).order_by(System.id))],
        "campaigns": [item.model_dump() for item in db.exec(select(Campaign).order_by(Campaign.id))],
        "sessions": [item.model_dump() for item in db.exec(select(GameSession).order_by(GameSession.id))],
    }
    content = csv_text.encode("utf-8") + b"\0" + json.dumps(snapshot, sort_keys=True, ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(content).hexdigest()


def save_import_backup(db: Session) -> str:
    filename = f"before-import-{datetime.now(timezone.utc):%Y%m%dT%H%M%S%fZ}.json"
    try:
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        with (BACKUP_DIR / filename).open("x", encoding="utf-8") as handle:
            json.dump(export_payload(db), handle, ensure_ascii=False, indent=2)
    except OSError as error:
        raise HTTPException(status_code=503, detail="Could not save a backup. Nothing was imported.") from error
    return filename


def plan_csv_import(db: Session, csv_text: str) -> dict:
    """Prepare an append-only import. External numeric IDs never become database IDs."""
    plan = {key: [] for key in ["systems", "campaigns", "sessions", "rows", "errors", "warnings"]}

    def problem(row: dict | None, message: str) -> None:
        plan["errors"].append({"row": row["row"] if row else None, "message": message})
        if row:
            row["status"] = "invalid"
            row["message"] = message

    def warning(row: dict, message: str) -> None:
        plan["warnings"].append({"row": row["row"], "message": message})

    def required(value: str, label: str) -> str:
        if not value:
            raise ValueError(f"{label} is required.")
        return value

    def timestamp(values: dict) -> dict:
        value = values.get("created_at", "")
        if not value:
            return {}
        try:
            datetime.fromisoformat(value)
        except ValueError as error:
            raise ValueError("Created-at timestamp is not a valid ISO timestamp.") from error
        return {"created_at": value}

    if len(csv_text.encode("utf-8")) > 5_000_000:
        problem(None, "The CSV file must be smaller than 5 MB.")
        return plan
    try:
        reader = csv.DictReader(io.StringIO(csv_text.lstrip("\ufeff"), newline=""), strict=True)
        headers = reader.fieldnames or []
        if len(headers) != len(set(headers)):
            problem(None, "The CSV contains duplicate column names.")
            return plan
        if not {"record_type", "name", "date", "gm", "system_name", "system_color"}.issubset(headers):
            problem(None, "Choose a CSV downloaded with this tracker's Export CSV button.")
            return plan
        source = []
        for number, values in enumerate(reader, 2):
            if not any(values.values()):
                continue
            if len(source) >= 10_000:
                problem(None, "The CSV can contain up to 10,000 records.")
                return plan
            row = {"row": number, "record_type": (values.get("record_type") or "").strip(), "name": (values.get("campaign_name") or values.get("name") or "").strip(), "date": (values.get("date") or "").strip(), "gm": (values.get("gm") or "").strip(), "system": (values.get("system_name") or "").strip(), "status": "invalid", "message": ""}
            plan["rows"].append(row)
            if None in values or any(value is None for value in values.values()):
                problem(row, "The number of columns does not match the header.")
                continue
            if row["record_type"] not in {"system", "campaign", "session"}:
                problem(row, "Record type must be system, campaign, or session.")
                continue
            source.append((row, {key: value.strip() for key, value in values.items()}))
    except csv.Error as error:
        problem(None, f"Could not read the CSV: {error}")
        return plan
    if not plan["rows"]:
        problem(None, "The CSV has no records to import.")
        return plan

    def named(items, label: str) -> dict:
        result = {}
        for item in items:
            key = import_name(item.name)
            if key in result:
                problem(None, f"Existing {label} names are ambiguous: {item.name}. Rename them before importing.")
            result[key] = item
        return result

    existing_systems = named(db.exec(select(System)), "system")
    existing_campaigns = named(db.exec(select(Campaign)), "campaign")
    system_keys = {item.id: key for key, item in existing_systems.items()}
    campaign_keys = {item.id: key for key, item in existing_campaigns.items()}
    systems = dict(existing_systems)
    campaigns = dict(existing_campaigns)
    source_ids = {"system": {}, "campaign": {}}
    definitions = {"system": {}, "campaign": {}}

    def register_id(values: dict, kind: str, key: str) -> None:
        external_id = values.get("id", "")
        if not external_id:
            return
        if not re.fullmatch(r"[1-9]\d*", external_id):
            raise ValueError("Record ID must be a positive whole number.")
        if external_id in source_ids[kind] and source_ids[kind][external_id] != key:
            raise ValueError(f"The file uses the same {kind} ID for different names.")
        source_ids[kind][external_id] = key

    def reference(values: dict, kind: str, available: dict, optional: bool = False) -> str | None:
        name = values.get(f"{kind}_name", "")
        external_id = values.get(f"{kind}_id", "")
        key = import_name(name) if name else source_ids[kind].get(external_id)
        if not key and optional and not external_id and not name:
            return None
        if not key or key not in available:
            raise ValueError(f"{kind.capitalize()} is missing or unknown. Include its definition or name.")
        if external_id in source_ids[kind] and source_ids[kind][external_id] != key:
            raise ValueError(f"{kind.capitalize()} name and ID refer to different records in the file.")
        return key

    for row, values in source:
        if row["record_type"] != "system":
            continue
        try:
            name = required(values.get("name", ""), "System name")
            key = import_name(name)
            color = values.get("system_color", "")
            if not re.fullmatch(r"#[0-9a-fA-F]{6}", color):
                raise ValueError("System color must use six hexadecimal digits, such as #58b6a9.")
            register_id(values, "system", key)
            item = {"name": name, "color": color, **timestamp(values)}
            if key in definitions["system"]:
                if definitions["system"][key]["color"].lower() != color.lower():
                    raise ValueError("The file gives this system more than one color.")
                row["status"] = "duplicate"
            elif key in existing_systems:
                row["status"] = "existing"
                if existing_systems[key].color.lower() != color.lower():
                    warning(row, f"{name}: the current system color will be kept.")
            else:
                row["status"] = "new"
                plan["systems"].append(item)
                systems[key] = item
            definitions["system"][key] = item
        except ValueError as error:
            problem(row, str(error))

    for row, values in source:
        if row["record_type"] != "campaign":
            continue
        try:
            name = required(values.get("name", ""), "Campaign name")
            key = import_name(name)
            system_key = reference(values, "system", systems)
            archived = values.get("archived", "") or "0"
            if archived not in {"0", "1"}:
                raise ValueError("Archived must be 0 or 1.")
            item = {"name": name, "system_key": system_key, "default_gm": normalize_gm(required(values.get("default_gm", ""), "Default GM")), "default_link": web_link(values.get("default_link", "")), "archived": int(archived), **timestamp(values)}
            register_id(values, "campaign", key)
            comparable = lambda data: (data["system_key"], data["default_gm"], data["default_link"], data["archived"])
            if key in definitions["campaign"]:
                if comparable(definitions["campaign"][key]) != comparable(item):
                    raise ValueError("The file gives this campaign conflicting defaults.")
                row["status"] = "duplicate"
            elif key in existing_campaigns:
                row["status"] = "existing"
                current = existing_campaigns[key]
                if (system_keys[current.system_id], current.default_gm, current.default_link, current.archived) != comparable(item):
                    warning(row, f"{name}: current campaign defaults and archive status will be kept.")
            else:
                row["status"] = "new"
                plan["campaigns"].append(item)
                campaigns[key] = item
            definitions["campaign"][key] = item
        except ValueError as error:
            problem(row, str(error))

    def identity(session_date: str, name: str, is_campaign: bool, gm: str, system_key: str) -> tuple:
        return session_date, import_name(name), is_campaign, import_name(gm), system_key

    existing_sessions = defaultdict(list)
    for item in db.exec(select(GameSession).order_by(GameSession.id)):
        campaign_key = campaign_keys.get(item.campaign_id)
        label = existing_campaigns[campaign_key].name if campaign_key else item.name or ""
        existing_sessions[identity(item.date, label, bool(campaign_key), item.gm, system_keys[item.system_id])].append(item)
    occurrences = Counter()
    session_ids = {}
    for row, values in source:
        if row["record_type"] != "session":
            continue
        try:
            system_key = reference(values, "system", systems)
            campaign_key = reference(values, "campaign", campaigns, optional=True)
            name = None if campaign_key else required(values.get("name", ""), "One-shot name")
            try:
                session_date = date.fromisoformat(required(values.get("date", ""), "Date")).isoformat()
            except ValueError as error:
                raise ValueError("Session date must be a valid ISO date, such as 2026-10-27.") from error
            gm = normalize_gm(required(values.get("gm", ""), "GM"))
            link = web_link(values.get("link", ""))
            notes = clean_optional(values.get("notes", ""))
            item = {"campaign_key": campaign_key, "system_key": system_key, "name": name, "date": session_date, "gm": gm, "link": link, "notes": notes, **timestamp(values)}
            external_id = values.get("id", "")
            if external_id:
                if not re.fullmatch(r"[1-9]\d*", external_id):
                    raise ValueError("Record ID must be a positive whole number.")
                if external_id in session_ids:
                    if session_ids[external_id] != item:
                        raise ValueError("The file gives the same session ID conflicting records.")
                    row["status"] = "duplicate"
                    row["message"] = "Repeated row in this file."
                    continue
                session_ids[external_id] = item
            campaign = campaigns.get(campaign_key)
            label = campaign.name if isinstance(campaign, Campaign) else campaign["name"] if campaign else name
            key = identity(session_date, label, bool(campaign_key), gm, system_key)
            occurrences[key] += 1
            row.update(name=label, date=session_date, gm=gm)
            if occurrences[key] <= len(existing_sessions[key]):
                row["status"] = "duplicate"
                current = existing_sessions[key][occurrences[key] - 1]
                if (current.link, current.notes) != (link, notes):
                    warning(row, f"{label} on {session_date}: current notes and link will be kept.")
            else:
                row["status"] = "new"
                plan["sessions"].append(item)
        except ValueError as error:
            problem(row, str(error))
    return plan


def import_seed_data(db: Session, csv_path: Path) -> None:
    rows = read_import_rows(csv_path)
    colors = ["#d46a6a", "#f0b84f", "#58b6a9", "#7d91e8", "#b56bd3", "#6aa05f"]
    systems: dict[str, System] = {}

    for system_name in sorted({row["system"] for row in rows}):
        system = System(name=system_name, color=colors[len(systems) % len(colors)])
        db.add(system)
        systems[system_name] = system
    db.commit()
    for system in systems.values():
        db.refresh(system)

    campaign_rows: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        if not is_one_shot(row["name"]):
            campaign_rows[row["name"]].append(row)

    campaigns: dict[str, Campaign] = {}
    for name, grouped_rows in sorted(campaign_rows.items()):
        default_gm = most_common(row["gm"] for row in grouped_rows)
        default_system_name = most_common(row["system"] for row in grouped_rows)
        campaign = Campaign(
            name=name,
            default_gm=default_gm,
            system_id=systems[default_system_name].id,
        )
        db.add(campaign)
        campaigns[name] = campaign
    db.commit()
    for campaign in campaigns.values():
        db.refresh(campaign)

    for row in rows:
        campaign = None if is_one_shot(row["name"]) else campaigns[row["name"]]
        db.add(
            GameSession(
                campaign_id=campaign.id if campaign else None,
                name=row["name"] if campaign is None else None,
                date=row["date"],
                gm=row["gm"],
                system_id=systems[row["system"]].id,
            )
        )
    db.commit()


def read_import_rows(csv_path: Path) -> list[dict[str, str]]:
    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        rows = []
        for row in csv.DictReader(handle):
            rows.append(
                {
                    "name": row["Name"].strip(),
                    "date": parse_notion_date(row["Date"]),
                    "gm": normalize_gm(row["GM"]),
                    "system": normalize_system(row["System"]),
                }
            )
        return rows


def parse_notion_date(value: str) -> str:
    return datetime.strptime(value.strip(), "%B %d, %Y").date().isoformat()


def normalize_gm(value: str) -> str:
    gm = value.strip()
    return "Anna" if gm == "Anna (me)" else gm


def normalize_system(value: str) -> str:
    system = value.strip()
    return system or "Unspecified"


def most_common(values) -> str:
    return Counter(values).most_common(1)[0][0]


def is_one_shot(name: str) -> bool:
    return "one-shot" in name.casefold()


def clean_optional(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None
