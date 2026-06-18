#!/bin/bash

# Exit immediately if any command fails
set -e

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  # Load env variables, ignoring comments
  export $(grep -v '^#' .env | xargs)
fi

# Fall back to environment defaults if variables are not specified
DB_USER=${DB_USER:-"root"}
DB_PASSWORD=${DB_PASSWORD:-""}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"3306"}
DB_NAME=${DB_NAME:-"crescent_chique_db"}

BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_${TIMESTAMP}.sql"

echo "=== Starting database backup ==="
echo "Host: $DB_HOST:$DB_PORT"
echo "Database: $DB_NAME"
echo "Target path: $BACKUP_FILE"

# Execute mysqldump
if [ -z "$DB_PASSWORD" ]; then
  mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
else
  MYSQL_PWD="$DB_PASSWORD" mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
fi

# Compress using gzip
gzip "$BACKUP_FILE"

echo "Backup finished successfully: ${BACKUP_FILE}.gz"
echo "================================="
