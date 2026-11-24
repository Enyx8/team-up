"""Сборка расширенного JSON анкеты для каталога (без изменения схемы БД)."""

from __future__ import annotations

import uuid
from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.orm import Session

import models
from schemas import ListingCatalogResponse


def _skills_by_listing(db: Session, listing_ids: list[uuid.UUID]) -> dict[uuid.UUID, list[str]]:
    if not listing_ids:
        return {}
    rows = db.execute(
        select(models.ListingSkills.listing_id, models.Skills.name)
        .join(models.Skills, models.Skills.id == models.ListingSkills.skill_id)
        .where(models.ListingSkills.listing_id.in_(listing_ids))
        .distinct()
        .order_by(models.ListingSkills.listing_id, models.Skills.name)
    ).all()
    out: dict[uuid.UUID, list[str]] = defaultdict(list)
    for listing_id, skill_name in rows:
        bucket = out[listing_id]
        if skill_name not in bucket:
            bucket.append(skill_name)
    return dict(out)


def _slots_by_listing(db: Session, listing_ids: list[uuid.UUID]) -> dict[uuid.UUID, int]:
    if not listing_ids:
        return {}
    rows = db.execute(
        select(models.ListingRoles.listing_id, models.ListingRoles.slots_needed).where(
            models.ListingRoles.listing_id.in_(listing_ids)
        )
    ).all()
    totals: dict[uuid.UUID, int] = defaultdict(int)
    for listing_id, slots in rows:
        totals[listing_id] += int(slots)
    return dict(totals)


def _users_with_university(
    db: Session, author_ids: list[uuid.UUID]
) -> dict[uuid.UUID, tuple[models.User, str | None]]:
    if not author_ids:
        return {}
    rows = db.execute(
        select(models.User, models.Universities.name)
        .outerjoin(models.Universities, models.Universities.id == models.User.university_id)
        .where(models.User.id.in_(author_ids))
    ).all()
    return {user.id: (user, university_name) for user, university_name in rows}


def listing_to_catalog(
    listing: models.Listing,
    user: models.User,
    university: str | None,
    skills: list[str],
    slots_needed: int | None,
) -> ListingCatalogResponse:
    return ListingCatalogResponse(
        id=listing.id,
        author_id=listing.author_id,
        type=listing.type,
        role_focus=listing.role_focus,
        bio=listing.bio,
        format=listing.format,
        status=listing.status,
        hackathons_count=listing.hackathons_count,
        created_at=listing.created_at,
        name=user.full_name,
        university=university,
        course=user.course,
        avatar_color=user.avatar_color,
        skills=skills,
        slots_needed=slots_needed,
        github_url=listing.github_url,
        author_github_url=user.github_url,
    )


def enrich_listings(db: Session, listings: list[models.Listing]) -> list[ListingCatalogResponse]:
    if not listings:
        return []

    listing_ids = [item.id for item in listings]
    author_ids = list({item.author_id for item in listings})
    users_map = _users_with_university(db, author_ids)
    skills_map = _skills_by_listing(db, listing_ids)
    member_ids = [item.id for item in listings if item.type == "seeking_members"]
    slots_map = _slots_by_listing(db, member_ids)

    result: list[ListingCatalogResponse] = []
    for listing in listings:
        user_row = users_map.get(listing.author_id)
        if not user_row:
            continue
        user, university = user_row
        slots = slots_map.get(listing.id) if listing.type == "seeking_members" else None
        result.append(
            listing_to_catalog(
                listing,
                user,
                university,
                skills_map.get(listing.id, []),
                slots if slots else (None if listing.type != "seeking_members" else 0),
            )
        )
    return result


def enrich_one(db: Session, listing: models.Listing) -> ListingCatalogResponse | None:
    enriched = enrich_listings(db, [listing])
    return enriched[0] if enriched else None