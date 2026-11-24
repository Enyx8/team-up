from datetime import datetime
import uuid
from typing import Literal, Text

from pydantic import BaseModel, ConfigDict, Field, EmailStr

class UserBase(BaseModel):
    full_name: str = Field(max_length=255)
    university_id: int | None = Field(default=None, ge=1)
    course: int | None = Field(default=None, ge=1)
    telegram: str | None = Field(max_length=150, default=None)
    avatar_color: str | None = Field(max_length=7, default=None)
    github_url: str | None = Field(max_length=255, default=None)

class UserPublicResponse(UserBase):
    """Ответ GET /{user_id} для публичных инстанций появления юзера (например в листинге)"""
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime

class UserPrivateResponse(UserBase):
    """Ответ GET /{user_id} для приватных инстанций появления юзера (например в профиле самого юзера)"""
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime
    email: EmailStr = Field(max_length=255)
    
class UserCreate(UserBase):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=255)

class UserUpdatePartial(BaseModel):
    full_name: str | None = Field(max_length=255, default=None)
    university_id: int | None = Field(default=None, ge=1)
    course: int | None = Field(default=None, ge=1)
    telegram: str | None = Field(max_length=150, default=None)
    avatar_color: str | None = Field(max_length=7, default=None)
    email: EmailStr | None = Field(max_length=255, default=None)
    password: str | None = Field(min_length=8, max_length=255, default=None)
    github_url: str | None = Field(max_length=255, default=None)

class Token(BaseModel):
    access_token: str
    token_type: str

class ListingBase(BaseModel):
    type: Literal["seeking_team", "seeking_members"]
    role_focus: Literal["backend", "frontend", "fullstack", "mobile", "ml",
    "data", "devops", "qa", "design", "pm"] | None = Field(default=None)
    bio: Text | None = Field(max_length=500, default=None)
    format: Literal["online", "offline"]
    status: Literal["active", "closed"]
    hackathons_count: int = Field(ge=0)
    github_url: str | None = Field(default=None, max_length=255)


class ListingCreate(BaseModel):
    type: Literal["seeking_team", "seeking_members"]
    role_focus: Literal["backend", "frontend", "fullstack", "mobile", "ml",
    "data", "devops", "qa", "design", "pm"] | None = Field(default=None)
    bio: Text | None = Field(max_length=500, default=None)
    format: Literal["online", "offline"]
    github_url: str | None = Field(default=None, max_length=255)
    skills: list[str] = Field(min_length=1)
    slots_needed: int | None = Field(default=None, ge=1, le=20)
    full_name: str = Field(max_length=150)
    university: str | None = Field(default=None, max_length=100)

class ListingResponse(ListingBase):
    author_id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime


class ListingCatalogResponse(ListingBase):
    """GET /listings: github_url — репозиторий проекта, author_github_url — GitHub автора."""

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
    author_github_url: str | None = None


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
    github_url: str | None = Field(default=None, max_length=255)


