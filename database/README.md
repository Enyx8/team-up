\# База данных Dream-Team



PostgreSQL 18. Схема — 8 таблиц, 4 enum-типа. Все изменения — через миграции в `database/migrations/`.



\## Структура

database/

├── migrations/ # SQL-миграции, применяются по порядку номеров

├── migrate.sh # скрипт применения всех миграций

└── README.md



\## Первый запуск



\### 1. Создать базу



```bash

psql -U postgres -c "CREATE DATABASE dream\_team\_db;"



cd <корень проекта>

bash database/migrate.sh

