from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# noinspection bad-argument-type
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_methods=['*'],
    allow_headers=['*']
)


#чисто для теста. Посты тип посты ищущих команду,
# параметры просто с туториала скопировал чтобы понять что куда
# потом подкорректируем под что надо

@app.get('/')
def home():
    return {'msg': 'ale)))), kto doma?'}

@app.get('/health')
def health():
    return {'health': 'ok'}