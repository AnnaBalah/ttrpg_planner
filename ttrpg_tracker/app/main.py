from __future__ import annotations

import csv
import io
import os
from collections import Counter, defaultdict
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, field_validator
from sqlalchemy import CheckConstraint, UniqueConstraint, event
from sqlmodel import Field, Session, SQLModel, create_engine, select


APP_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = APP_DIR / "frontend"
IMPORT_CSV = APP_DIR / "import_source" / "notion_sessions_all.csv"
DB_PATH = Path(os.getenv("TTRPG_DB_PATH", APP_DIR / "ttrpg.db"))
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

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


class SystemCreate(BaseModel):
    name: str
    color: str


class SystemUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class SystemRead(SystemCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: str


class CampaignCreate(BaseModel):
    name: str
    default_gm: str
    system_id: int
    default_link: Optional[str] = None
    archived: int = 0


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    default_gm: Optional[str] = None
    system_id: Optional[int] = None
    default_link: Optional[str] = None
    archived: Optional[int] = None


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
    gm: Optional[str] = None
    system_id: Optional[int] = None
    link: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("date")
    @classmethod
    def valid_iso_date(cls, value: str) -> str:
        date.fromisoformat(value)
        return value


class SessionUpdate(BaseModel):
    campaign_id: Optional[int] = None
    name: Optional[str] = None
    date: Optional[str] = None
    gm: Optional[str] = None
    system_id: Optional[int] = None
    link: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("date")
    @classmethod
    def valid_iso_date(cls, value: Optional[str]) -> Optional[str]:
        if value is not None:
            date.fromisoformat(value)
        return value


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
        has_sessions = db.exec(select(GameSession.id)).first() is not None
        if not has_sessions and IMPORT_CSV.exists():
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
        existing = db.exec(select(System).where(System.name == payload.name)).first()
        if existing:
            raise HTTPException(status_code=409, detail="System name already exists")
        system = System(name=payload.name.strip(), color=payload.color.strip())
        db.add(system)
        db.commit()
        db.refresh(system)
        return system


@app.put("/api/systems/{system_id}", response_model=SystemRead)
def update_system(system_id: int, payload: SystemUpdate) -> System:
    with Session(engine) as db:
        system = require_system(db, system_id)
        updates = payload.model_dump(exclude_unset=True)
        if "name" in updates:
            existing = db.exec(select(System).where(System.name == updates["name"])).first()
            if existing and existing.id != system_id:
                raise HTTPException(status_code=409, detail="System name already exists")
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
        require_system(db, payload.system_id)
        existing = db.exec(select(Campaign).where(Campaign.name == payload.name)).first()
        if existing:
            raise HTTPException(status_code=409, detail="Campaign name already exists")
        campaign = Campaign(**payload.model_dump())
        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        systems = system_map(db)
        return campaign_read(campaign, systems[campaign.system_id])


@app.put("/api/campaigns/{campaign_id}", response_model=CampaignRead)
def update_campaign(campaign_id: int, payload: CampaignUpdate) -> CampaignRead:
    with Session(engine) as db:
        campaign = require_campaign(db, campaign_id)
        updates = payload.model_dump(exclude_unset=True)
        if "system_id" in updates:
            require_system(db, updates["system_id"])
        if "name" in updates:
            existing = db.exec(select(Campaign).where(Campaign.name == updates["name"])).first()
            if existing and existing.id != campaign_id:
                raise HTTPException(status_code=409, detail="Campaign name already exists")
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
        merged = SessionCreate(
            campaign_id=updates.get("campaign_id", item.campaign_id),
            name=updates.get("name", item.name),
            date=updates.get("date", item.date),
            gm=updates.get("gm", item.gm),
            system_id=updates.get("system_id", item.system_id),
            link=updates.get("link", item.link),
            notes=updates.get("notes", item.notes),
        )
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
