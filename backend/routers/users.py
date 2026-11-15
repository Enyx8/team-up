import uuid

from fastapi import HTTPException, Depends, status, APIRouter
from listing_catalog import enrich_listings
from schemas import ListingCatalogResponse
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Annotated
import models
from database import Base, engine, get_db

router = APIRouter()

@router.get('/{user_id}/listings', response_model=list[ListingCatalogResponse])
def get_users_listings(user_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.User).where(models.User.id==user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='user doesnt exist')

    result = db.execute(select(models.Listing).where(models.Listing.author_id==user_id))
    user_listings = result.scalars().all()
    return enrich_listings(db, user_listings)