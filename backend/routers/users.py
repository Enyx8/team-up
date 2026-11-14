import uuid

from fastapi import HTTPException, Depends, status, APIRouter
from schemas import ListingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Annotated
import models
from database import Base, engine, get_db

router = APIRouter()

@router.get('/{user_id}/listings', response_model=list[ListingResponse])
def get_users_listings(user_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.User).where(models.User.id==user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='user doesnt exist')

    result = db.execute(select(models.Listing).where(models.Listing.author_id==user_id))
    user_listings = result.scalars().all()
    return user_listings