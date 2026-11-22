import enum
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, SmallInteger, func, Boolean, text
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, index=True,
                                     server_default=func.gen_random_uuid())
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(150))
    university_id: Mapped[int | None] = mapped_column(ForeignKey("universities.id"))
    course: Mapped[int | None] = mapped_column(SmallInteger)
    telegram: Mapped[str | None] = mapped_column(String(150))
    avatar_color: Mapped[str | None] = mapped_column(String(7))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True),
                                                 default=func.now())

    listings: Mapped[list[Listing]] = relationship(back_populates="author", cascade="all, delete-orphan")

class Universities(Base):
    __tablename__ = 'universities'

    id: Mapped[int] = mapped_column(primary_key=True,
                                    server_default=text("nextval('universities_id_seq'::regclass)"))
    name: Mapped[str | None] = mapped_column(String(100))
    city: Mapped[str | None] = mapped_column(String(100))



class Listing(Base):
    __tablename__ = 'listings'

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    author_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))

    LISTING_TYPES = ["seeking_team", "seeking_members"]
    type: Mapped[str] = mapped_column(ENUM(*LISTING_TYPES, name='listing_type', create_type=False))

    ROLES = ["backend", "frontend", "fullstack", "mobile", "ml", "data", "devops", "qa", "design", "pm"]
    role_focus: Mapped[str | None] = mapped_column(ENUM(*ROLES, name='role_focus', create_type=False))

    bio: Mapped[str | None] = mapped_column(Text)

    LISTING_FORMATS = ["online", "offline"]
    format: Mapped[str] = mapped_column(ENUM(*LISTING_FORMATS, name='listing_format',
                                                create_type=False), server_default='online')

    STATUSES = ["active", "closed"]
    status: Mapped[str] = mapped_column(ENUM(*STATUSES, name='listing_status', create_type=False),
                                        server_default='active')

    hackathons_count: Mapped[int] = mapped_column(SmallInteger, server_default='0')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    author: Mapped[User] = relationship(back_populates="listings")

class Messages(Base):
    __tablename__ = 'messages'
    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    sender_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    receiver_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    listing_id: Mapped[UUID | None] = mapped_column(ForeignKey("listings.id"))
    content: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, server_default='false')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class ListingRoles(Base):
    __tablename__ = 'listing_roles'

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    listing_id: Mapped[UUID] = mapped_column(ForeignKey('listings.id'))

    ROLES = ["backend", "frontend", "fullstack", "mobile", "ml", "data", "devops", "qa", "design", "pm"]
    role_focus: Mapped[str] = mapped_column(ENUM(*ROLES, name='role_focus', create_type=False))

    slots_needed: Mapped[int] = mapped_column(SmallInteger, server_default='1')

class ListingSkills(Base):
    __tablename__ = 'listing_skills'

    listing_id: Mapped[UUID] = mapped_column(ForeignKey('listings.id'), primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey('skills.id'), primary_key=True)

class UserSkills(Base):
    __tablename__ = 'user_skills'

    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'), primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey('skills.id'), primary_key=True)

class Skills(Base):
    __tablename__ = 'skills'

    id: Mapped[int] = mapped_column(primary_key=True, server_default=text("nextval('skills_id_seq'::regclass)"))
    name: Mapped[str] = mapped_column(String(100))
    category: Mapped[str | None] = mapped_column(String(150))