#!/bin/bash

# Configuration
APP_DIR="/var/www/ramadan-planner"
DB_PATH="$APP_DIR/prisma/dev.db"
BACKUP_DIR="/var/backups/ramadan-planner"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.db"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup
if [ -f "$DB_PATH" ]; then
    echo "Creating backup of $DB_PATH to $BACKUP_FILE..."
    cp "$DB_PATH" "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo "Backup successful: $BACKUP_FILE"
    else
        echo "Backup failed!"
        exit 1
    fi
else
    echo "Database file not found at $DB_PATH"
    exit 1
fi

# Cleanup old backups
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "backup_*.db" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup process completed."
