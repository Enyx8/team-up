from fastapi import FastAPI, HTTPException, status, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import PostCreate, PostResponse

app = FastAPI()
# noinspection bad-argument-type
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_methods=['*'],
    allow_headers=['*']
)


#dummy data
posts: list[dict] = [
    {
        "id": 1,
        "author": "Андрей санстрайк",
        "title": "Ищу команду на хакатон",
        "content": "Огоооооооооооооооооооооооооооооооооооооооооооооо",
        "date_posted": "April 20, 2025",
        "known_languages": ['Python', 'C++', 'Assembler']
    },
    {
        "id": 2,
        "author": "Джон Питон",
        "title": "Ищу команду на Олимпиаду",
        "content": "Хочу команду найду туда сюда я ваще крутой классный всё в соло закрою.",
        "date_posted": "April 20, 2025",
        "known_languages": ['Python', 'C++', 'Assembler']
    },
]

@app.get('/')
def home():
    return {'msg': 'ale)))), kto doma?'}
    #мб в начальной странице сделать выбор типо куда ищете Хакатон олимпиаду и направить на нужную страницу

@app.get('/health')
def health():
    return {'health': 'ok'}

@app.get('/posts/{post_id}')
def post_page(post_id):
    post_id: int
    for post in posts:
        if post.get('id') == post_id:
            return post
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")


@app.get('/posts', response_model=list[PostResponse])
def get_posts():
    return posts

@app.post(
    "/api/posts",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_post(post: PostCreate):
    new_id = max(p["id"] for p in posts) + 1 if posts else 1
    new_post = {
        "id": new_id,
        "author": post.author,
        "title": post.title,
        "content": post.content,
        "date_posted": "April 23, 2025",
        "known_languages": ["Python"]
    }
    posts.append(new_post)
    return new_post

#я чисто с туторила эти оба хендлера скопировал
@app.exception_handler(StarletteHTTPException)
def general_http_exception_handler(request: Request, exception: StarletteHTTPException):
    message = (
        exception.detail
        if exception.detail
        else "An error occurred. Please check your request and try again."
    )

    if request.url.path.startswith("/api"):
        return JSONResponse(
            status_code=exception.status_code,
            content={"detail": message},
        )
    #html я пока не знаю чё там как там поэтому пока чисто с api


@app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exception: RequestValidationError):
    if request.url.path.startswith("/api"):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": exception.errors()},
        )