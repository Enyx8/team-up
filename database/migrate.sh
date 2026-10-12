#!/usr/bin/env bash
set -e

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-dream_team_db}
DB_USER=${DB_USER:-postgres}

echo "Применяю миграции к базе: $DB_NAME на $DB_HOST:$DB_PORT"

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
    version    TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
SQL

for file in database/migrations/*.sql; do
    version=$(basename "$file")
    applied=$(psql -tA -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -c "SELECT 1 FROM schema_migrations WHERE version = '$version'")

    if [ "$applied" = "1" ]; then
        echo "  skip  $version"
        continue
    fi

    echo "  apply $version"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -c "INSERT INTO schema_migrations(version) VALUES ('$version')"
done

echo "Готово."