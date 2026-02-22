#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE skyvern_ui;
    GRANT ALL PRIVILEGES ON DATABASE skyvern_ui TO $POSTGRES_USER;
EOSQL
