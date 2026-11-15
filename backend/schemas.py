from datetime import datetime, UTC
import uuid
from typing import Literal, Text

from pydantic import BaseModel, ConfigDict, Field

class ListingBase(BaseModel):
    type: Literal["seeking_team", "seeking_members"]
    role_focus: Literal["backend", "frontend", "fullstack", "mobile", "ml",
    "data", "devops", "qa", "design", "pm"] | None = Field(default=None)
    bio: Text | None = Field(max_length=500, default=None)
    format: Literal["online", "offline"]
    status: Literal["active", "closed"]
    hackathons_count: int = Field(ge=0)


class ListingCreate(ListingBase):
    author_id: uuid.UUID

class ListingResponse(ListingBase):
    author_id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime


class ListingCatalogResponse(ListingBase):
    """Ответ GET /listings и GET /listings/{id} — данные для карточки каталога."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    author_id: uuid.UUID
    created_at: datetime
    name: str
    university: str | None = None
    course: int | None = Field(default=None, ge=1, le=6)
    avatar_color: str | None = None
    skills: list[str] = Field(default_factory=list)
    slots_needed: int | None = Field(default=None, ge=0)


class ListingUpdateFull(ListingBase):
    pass

class ListingUpdatePartial(BaseModel):
    type: Literal["seeking_team", "seeking_members"] | None = Field(default=None)
    role_focus: Literal["backend", "frontend", "fullstack", "mobile",
    "ml", "data", "devops", "qa",
    "design", "pm"] | None = Field(default=None)
    bio: Text | None = Field(default=None, max_length=500)
    format: Literal["online", "offline"] | None = Field(default=None)
    status: Literal["active", "closed"] | None = Field(default=None)
    hackathons_count: int | None = Field(default=None, ge=0)