from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers import listings, users

app = FastAPI()
# noinspection bad-argument-type
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', "http://127.0.0.1:8000"],
    allow_methods=['*'],
    allow_headers=['*']
)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(listings.router, prefix="/listings", tags=["listings"])

#------------------------------
#----------GETTING-------------
#------------------------------
@app.get('/')
@app.get('/health')
def health():
    return {'health': 'ok'}

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