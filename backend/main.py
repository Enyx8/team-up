from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import ListingCreate, ListingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Annotated
import models
from database import Base, engine, get_db

app = FastAPI()
# noinspection bad-argument-type
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_methods=['*'],
    allow_headers=['*']
)

#------------------------------
#----------GETTING-------------
#------------------------------
@app.get('/')
@app.get('/health')
def health():
    return {'health': 'ok'}

@app.get('/listings/{listing_id}', response_model=ListingResponse)
def get_one_listing(listing_id: int, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Listing).where(models.Listing.id == listing_id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    else:
        return listing

@app.get('/users/{user_id}/listings', response_model=list[ListingResponse])
def get_users_listings(user_id: int, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.User).where(models.User.id==user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='user doesnt exist')

    result = db.execute(select(models.Listing).where(models.Listing.author_id==user_id))
    user_listings = result.scalars().all()
    return user_listings


@app.get('/listings', response_model=list[ListingResponse])
def get_listings(db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Listing))
    listings = result.scalars().all()
    return listings


#----------------------------------------
#------------POSTING---------------------
#----------------------------------------

@app.post(
    "/listings",
    response_model=ListingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_listing(listing: ListingCreate, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Listing).where(models.Listing.id == listing.id))
    existing_listing = result.scalars().first()

    if existing_listing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='same listing already exist'
        )

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



#-------------------------------------------
# ---------------HANDLERS-------------------
#-------------------------------------------
#я чисто с туторила эти оба хендлера скопировал
@app.exception_handler(StarletteHTTPException)
def general_http_exception_handler(request: Request, exception: StarletteHTTPException):
    message = (
        exception.detail
        if exception.detail
        else "An error occurred. Please check your request and try again."
    )

    return JSONResponse(
        status_code=exception.status_code,
        content={"detail": message},
    )
    #html я пока не знаю чё там как там поэтому пока чисто с api

#dead code at the moment
@app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exception: RequestValidationError):
    if request.url.path.startswith("/api"):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": exception.errors()},
        )