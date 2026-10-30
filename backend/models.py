import enum
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, SmallInteger, func, Boolean, text
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, index=True, nullable=False,
                                     server_default=func.gen_random_uuid())
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    university_id: Mapped[int] = mapped_column(Integer)
    course: Mapped[int] = mapped_column(SmallInteger)
    telegram: Mapped[int] = mapped_column(String(150))
    avatar_color: Mapped[str] = mapped_column(String(7))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False,
                                                 default=func.now())

class Universities(Base):
    __tablename__ = 'universities'

    id: Mapped[int] = mapped_column(ForeignKey("users.university_id"), primary_key=True, nullable=False,
                                    server_default=text("nextval('universities_id_seq'::regclass)"))
    name: Mapped[str] = mapped_column(String(100))
    city: Mapped[str] = mapped_column(String(100))



class Listing(Base):
    __tablename__ = 'listings'

    id: Mapped[UUID] = mapped_column(primary_key=True, nullable=False, server_default=func.gen_random_uuid())
    author_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"),nullable=False)

    LISTING_TYPES = ["seeking_team", "seeking_members"]
    type: Mapped[str] = mapped_column(ENUM(*LISTING_TYPES, name='listing_type', create_type=False), nullable=False)

    ROLES = ["backend", "frontend", "fullstack", "mobile", "ml", "data", "devops", "qa", "design", "pm"]
    role_focus: Mapped[str] = mapped_column(ENUM(*ROLES, name='role_focus', create_type=False))

    bio: Mapped[str] = mapped_column(Text)

    LISTING_FORMATS = ["online", "offline"]
    format: Mapped[str] = mapped_column(ENUM(*LISTING_FORMATS, name='listing_format',
                                                create_type=False), server_default='online', nullable=False)

    STATUSES = ["active", "closed"]
    status: Mapped[str] = mapped_column(ENUM(*STATUSES, name='status', create_type=False),
                                        server_default='active', nullable=False)

    hackathons_count: Mapped[int] = mapped_column(SmallInteger, nullable=False, server_default='0')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

class Messages(Base):
    __tablename__ = 'messages'
    id: Mapped[UUID] = mapped_column(primary_key=True, nullable=False, server_default=func.gen_random_uuid())
    sender_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    receiver_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    listing_id: Mapped[UUID] = mapped_column(ForeignKey("listings.id"))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default='false')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

class ListingRoles(Base):
    __tablename__ = 'listing_roles'

    id: Mapped[UUID] = mapped_column(primary_key=True, nullable=False, server_default=func.gen_ranomd_uuid())
    listing_id: Mapped[UUID] = mapped_column(ForeignKey('listings.id'), nullable=False)

    ROLES = ["backend", "frontend", "fullstack", "mobile", "ml", "data", "devops", "qa", "design, pm"]
    role_focus: Mapped[str] = mapped_column(ENUM(*ROLES, name='role_focus', create_type=False), nullable=False)

    slots_needed: Mapped[int] = mapped_column(SmallInteger, nullable=False, server_default='1')

class ListingSkills(Base):
    __tablename__ = 'listing_skills'

    listing_id: Mapped[UUID] = mapped_column(ForeignKey('lisings.id'), primary_key=True, nullable=False)
    skill_id: Mapped[int] = mapped_column(ForeignKey('skills.id'), primary_key=True, nullable=False)

class UserSkills(Base):
    __tablename__ = 'user_skills'

    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'), primary_key=True, nullable=False)
    skill_id: Mapped[UUID] = mapped_column(ForeignKey('skills.id'), primary_key=True, nullable=False)

class Skills(Base):
    __tablename__ = 'skills'

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False, server_default=text("nextval('skills_id_seq'::regclass)"))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(150))