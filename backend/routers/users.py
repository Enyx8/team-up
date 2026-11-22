import uuid

from fastapi import HTTPException, Depends, status, APIRouter
from listing_catalog import enrich_listings
from schemas import ListingCatalogResponse, UserPublicResponse, UserPrivateResponse, UserCreate, UserUpdatePartial, Token
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from typing import Annotated
import models
from database import Base, engine, get_db
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm
from auth import create_access_token, hash_password, oauth2_scheme, verify_access_token, verify_password
from config import settings
router = APIRouter()

"""
------------------------------
-------CREATING/POSTING-------
------------------------------
"""

@router.post('', response_model=UserPrivateResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.User).where(models.User.email == user_data.email))
    user_with_same_email = result.scalars().first()
    if user_with_same_email:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='User with this email already exist')

    password_hash = hash_password(user_data.password)
    new_user = models.User(
        email=user_data.email.lower(),
        password_hash=password_hash,
        full_name=user_data.full_name,
        university_id=user_data.university_id,
        course=user_data.course,
        telegram=user_data.telegram,
        avatar_color=user_data.avatar_color
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
    # Look up user by email (case-insensitive)
    # Note: OAuth2PasswordRequestForm uses "username" field, but we treat it as email
    result = db.execute(
        select(models.User).where(
            func.lower(models.User.email) == form_data.username.lower(),
        ),
    )
    user = result.scalars().first()

    # Verify user exists and password is correct
    # Don't reveal which one failed (security best practice)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise

    # Create access token with user id as subject
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires,
    )
    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=UserPrivateResponse)
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get the currently authenticated user."""
    user_id = verify_access_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Validate user_id is a valid uuid (defense against malformed JWT)
    try:
        user_id_uuid = uuid.UUID(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    result = db.execute(
        select(models.User).where(models.User.id == user_id_uuid),
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

"""
--------------------
--------GETTING-----
--------------------
"""
@router.get('', response_model=list[UserPublicResponse])
def get_users(db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.User))
    users = result.scalars().all()
    return users

@router.get('/{user_id}', response_model=UserPublicResponse)
def get_one_user(user_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.User).where(models.User.id==user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='user doesnt exist')

    return user

@router.get('/{user_id}/listings', response_model=list[ListingCatalogResponse])
def get_users_listings(user_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.User).where(models.User.id==user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='user doesnt exist')

    result = db.execute(select(models.Listing).where(models.Listing.author_id==user_id))
    user_listings = result.scalars().all()
    return enrich_listings(db, user_listings)


"""
------------------
-----UPDATING-----
------------------
"""
@router.patch('/{user_id}', response_model=UserPrivateResponse)
def update_one_user_partially(user_id: uuid.UUID, user_data: UserUpdatePartial, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    if user_data.email is not None:
        user.email = user_data.email.lower()

    db.commit()
    db.refresh(user)
    return user

"""
---------------------
------DELETING-------
---------------------
"""
@router.delete('/{user_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_one_user(user_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.delete(user)
    db.commit()