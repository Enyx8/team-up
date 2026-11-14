import uuid

from fastapi import HTTPException, Depends, status, APIRouter
from schemas import ListingCreate, ListingResponse, ListingUpdatePartial, ListingUpdateFull
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Annotated
import models as models
from database import Base, engine, get_db


router = APIRouter()

"""
------------------
------GETTING-----
------------------
"""
@router.get('/{listing_id}', response_model=ListingResponse)
def get_one_listing(listing_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Listing).where(models.Listing.id == listing_id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    else:
        return listing

@router.get('', response_model=list[ListingResponse])
def get_listings(db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Listing))
    listings = result.scalars().all()
    return listings


"""
----------------------------------------
------------POSTING---------------------
----------------------------------------
"""
@router.post(
    "",
    response_model=ListingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_listing(listing: ListingCreate, db: Annotated[Session, Depends(get_db)]):
    new_listing = models.Listing(
        author_id=listing.author_id,
        type=listing.type,
        role_focus=listing.role_focus,
        bio=listing.bio,
        format=listing.format,
        status=listing.status,
        hackathons_count=listing.hackathons_count,
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    return new_listing


"""
--------------------------
----------UPDATING--------
--------------------------
"""
@router.put('/{listing_id}', response_model=ListingResponse)
def update_listing_full(listing_data: ListingUpdateFull, listing_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Listing).where(models.Listing.id == listing_id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    listing.type = listing_data.type
    listing.role_focus = listing_data.role_focus
    listing.bio = listing_data.bio
    listing.format = listing_data.format
    listing.status = listing_data.status
    listing.hackathons_count = listing_data.hackathons_count

    db.commit()
    db.refresh(listing)
    return listing

@router.patch('/{listing_id}', response_model=ListingResponse)
def update_listing_partial(listing_data: ListingUpdatePartial, listing_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Listing).where(models.Listing.id == listing_id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

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
def delete_listing(listing_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Listing).where(models.Listing.id == listing_id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    db.delete(listing)
    db.commit()