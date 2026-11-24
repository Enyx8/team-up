import uuid
from typing import Annotated

import models as models
from database import Base, engine, get_db
from fastapi import HTTPException, Depends, status, APIRouter
from listing_catalog import enrich_listings, enrich_one
from schemas import (
    ListingCatalogResponse,
    ListingCreate,
    ListingResponse,
    ListingUpdatePartial,
    ListingUpdateFull,
)
from sqlalchemy import select
from sqlalchemy.orm import Session
from auth import CurrentUser

router = APIRouter()

"""
------------------
------GETTING-----
------------------
"""
@router.get('/{listing_id}', response_model=ListingCatalogResponse)
def get_one_listing(listing_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Listing).where(models.Listing.id == listing_id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    catalog_item = enrich_one(db, listing)
    if not catalog_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing author not found")
    return catalog_item

@router.get('', response_model=list[ListingCatalogResponse])
def get_listings(db: Annotated[Session, Depends(get_db)]):
    result = db.execute(
        select(models.Listing).where(models.Listing.status == "active").order_by(models.Listing.created_at.desc())
    )
    listings = result.scalars().all()
    return enrich_listings(db, listings)


"""
----------------------------------------
------------POSTING---------------------
----------------------------------------
"""
@router.post(
    "",
    response_model=ListingCatalogResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_listing(listing: ListingCreate, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    skill_names = [name.strip() for name in listing.skills if name.strip()]
    if not skill_names:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Нужен хотя бы один навык")

    skill_rows = db.execute(
        select(models.Skills).where(models.Skills.name.in_(skill_names))
    ).scalars().all()
    skills_by_name = {row.name: row for row in skill_rows}
    missing = [name for name in skill_names if name not in skills_by_name]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Неизвестный навык: {', '.join(missing)}",
        )

    if listing.type == "seeking_members" and not listing.role_focus:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Для запроса команды укажи роль",
        )

    github = listing.github_url.strip() if listing.github_url else None
    listing_github = github if listing.type == "seeking_members" else None

    new_listing = models.Listing(
        author_id=current_user.id,
        type=listing.type,
        role_focus=listing.role_focus,
        bio=listing.bio,
        format=listing.format,
        status="active",
        hackathons_count=0,
        github_url=listing_github,
    )
    db.add(new_listing)
    db.flush()

    for name in skill_names:
        skill = skills_by_name[name]
        db.add(models.ListingSkills(listing_id=new_listing.id, skill_id=skill.id))

    if listing.type == "seeking_members":
        db.add(
            models.ListingRoles(
                listing_id=new_listing.id,
                role_focus=listing.role_focus,
                slots_needed=listing.slots_needed or 1,
            )
        )

    current_user.full_name = listing.full_name.strip()
    if listing.type == "seeking_team" and github:
        current_user.github_url = github
    if listing.university:
        university = db.execute(
            select(models.Universities).where(models.Universities.name == listing.university)
        ).scalars().first()
        if university:
            current_user.university_id = university.id

    db.commit()
    db.refresh(new_listing)
    catalog_item = enrich_one(db, new_listing)
    if not catalog_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing author not found")
    return catalog_item


"""
--------------------------
----------UPDATING--------
--------------------------
"""
@router.put('/{listing_id}', response_model=ListingResponse)
def update_listing_full(listing_data: ListingUpdateFull, listing_id: uuid.UUID,
                        current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Listing).where(models.Listing.id == listing_id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    if listing.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized to edit this post')

    listing.type = listing_data.type
    listing.role_focus = listing_data.role_focus
    listing.bio = listing_data.bio
    listing.format = listing_data.format
    listing.status = listing_data.status
    listing.hackathons_count = listing_data.hackathons_count
    listing.github_url = listing_data.github_url

    db.commit()
    db.refresh(listing)
    return listing

@router.patch('/{listing_id}', response_model=ListingResponse)
def update_listing_partial(listing_data: ListingUpdatePartial, listing_id: uuid.UUID,
                           current_user: CurrentUser,db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Listing).where(models.Listing.id == listing_id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    if listing.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized to edit this post')

    update_data = listing_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(listing, field, value)

    db.commit()
    db.refresh(listing)
    return listing

"""
--------------------------
----------DELETING--------
--------------------------
"""
@router.delete('/{listing_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(listing_id: uuid.UUID, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Listing).where(models.Listing.id == listing_id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    if listing.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Not authorized to delete this post')

    db.delete(listing)
    db.commit()