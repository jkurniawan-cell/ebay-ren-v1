#!/bin/bash
# Setup daily cron job to refresh Airtable data dump
# This script adds a cron job that runs at 2 AM daily

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DUMP_SCRIPT="$SCRIPT_DIR/dump_airtable.py"
LOG_FILE="$PROJECT_DIR/data/dump.log"

# Cron job command (runs at 2 AM daily)
CRON_CMD="0 2 * * * cd $PROJECT_DIR && /usr/bin/python3 $DUMP_SCRIPT >> $LOG_FILE 2>&1"

echo "=========================================="
echo "AIRTABLE DATA DUMP - CRON JOB SETUP"
echo "=========================================="
echo ""
echo "This will add a cron job to run daily at 2:00 AM"
echo "Command: $CRON_CMD"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "dump_airtable.py"; then
    echo "WARNING: Cron job already exists!"
    echo "Current crontab:"
    echo ""
    crontab -l | grep dump_airtable.py
    echo ""
    read -p "Replace it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 1
    fi
    # Remove old cron job
    crontab -l | grep -v "dump_airtable.py" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -

echo ""
echo "✓ Cron job added successfully!"
echo ""
echo "Verify with:"
echo "  crontab -l"
echo ""
echo "View logs at:"
echo "  tail -f $LOG_FILE"
echo ""
echo "Manual run:"
echo "  python3 $DUMP_SCRIPT"
echo ""
