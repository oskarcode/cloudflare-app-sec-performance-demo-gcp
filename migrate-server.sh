#!/bin/bash

# Server Migration Script
# This script helps automate the migration process to a new server

set -e

# Configuration - UPDATE THESE VALUES FOR YOUR MIGRATION
SOURCE_ZONE="us-east4-b"
SOURCE_VM="oskar-appdemo-se"
SOURCE_PROJECT="globalse-198312"
SOURCE_USER="oskar"
SOURCE_PATH="/home/oskar/cloudflare-demo-ecommerce"

TARGET_SERVER="new-server-ip"
TARGET_USER="new-user"
TARGET_PATH="/home/new-user/cloudflare-demo-ecommerce"

echo "🚀 Starting server migration process..."
echo "Source: $SOURCE_VM ($SOURCE_ZONE)"
echo "Target: $TARGET_SERVER"
echo ""

# Function to execute commands on source server
execute_source() {
    gcloud compute ssh --zone "$SOURCE_ZONE" "$SOURCE_VM" --project "$SOURCE_PROJECT" --command "$1"
}

# Function to execute commands on target server
execute_target() {
    ssh "$TARGET_USER@$TARGET_SERVER" "$1"
}

# Step 1: Backup source server
echo "📦 Step 1: Creating backup on source server..."
execute_source "
    cd ~
    mkdir -p migration-backup
    cd migration-backup
    
    # Backup project
    cp -r $SOURCE_PATH ./project-backup
    
    # Backup database
    cp $SOURCE_PATH/db.sqlite3 ./db-backup.sqlite3
    
    # Create migration info
    cat > migration-info.txt << EOF
Source Server Migration Info
===========================
Date: \$(date)
Source IP: \$(curl -s ifconfig.me)
Source VM: $SOURCE_VM
Source Zone: $SOURCE_ZONE
Source Project: $SOURCE_PROJECT
Source User: $SOURCE_USER
Source Path: $SOURCE_PATH
EOF
    
    # Compress backup
    tar -czf migration-backup-\$(date +%Y%m%d-%H%M).tar.gz project-backup/ db-backup.sqlite3 migration-info.txt
    
    echo '✅ Backup created successfully'
    ls -la migration-backup-*.tar.gz
"

# Step 2: Transfer files to target server
echo ""
echo "📤 Step 2: Transferring files to target server..."

# Get the backup filename
BACKUP_FILE=$(execute_source "ls -t ~/migration-backup/migration-backup-*.tar.gz | head -1 | xargs basename")
echo "Backup file: $BACKUP_FILE"

# Transfer backup file
execute_source "scp ~/migration-backup/$BACKUP_FILE $TARGET_USER@$TARGET_SERVER:~/"

# Step 3: Setup target server
echo ""
echo "🔧 Step 3: Setting up target server..."
execute_target "
    # Extract backup
    tar -xzf $BACKUP_FILE
    
    # Move project to target location
    mkdir -p $(dirname $TARGET_PATH)
    mv project-backup $TARGET_PATH
    
    # Set permissions
    sudo chown -R $TARGET_USER:$TARGET_USER $TARGET_PATH
    
    echo '✅ Files extracted and permissions set'
"

# Step 4: Install Docker on target server (if needed)
echo ""
echo "🐳 Step 4: Installing Docker on target server..."
execute_target "
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo 'Installing Docker...'
        sudo apt update
        sudo apt install -y docker.io docker-compose-plugin
        sudo systemctl enable docker
        sudo systemctl start docker
        sudo usermod -aG docker $TARGET_USER
        echo '⚠️  Docker installed. Please logout and login again to apply group changes.'
    else
        echo '✅ Docker already installed'
    fi
"

# Step 5: Update configuration files
echo ""
echo "⚙️ Step 5: Updating configuration files..."
echo "Please manually update the following files on the target server:"
echo "1. $TARGET_PATH/docker-compose.yml - Update ALLOWED_HOSTS"
echo "2. $TARGET_PATH/nginx.conf - Update server_name"
echo "3. $TARGET_PATH/deploy-production.sh - Update server details"
echo ""
echo "Example updates needed:"
echo "ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,NEW_SERVER_IP,NEW_DOMAIN.com"
echo "server_name NEW_DOMAIN.com NEW_SERVER_IP;"
echo ""

# Step 6: Start application on target server
echo "🚀 Step 6: Starting application on target server..."
execute_target "
    cd $TARGET_PATH
    
    # Start containers
    docker-compose up -d --build
    
    # Wait for startup
    sleep 15
    
    # Test health endpoint
    curl -f http://localhost/health/ && echo '✅ Application started successfully'
    
    # Show container status
    docker-compose ps
"

echo ""
echo "🎉 Migration script completed!"
echo ""
echo "Next steps:"
echo "1. Update DNS records to point to new server"
echo "2. Update Cloudflare configuration"
echo "3. Test all endpoints"
echo "4. Verify security features"
echo "5. Decommission old server (optional)"
echo ""
echo "Test commands:"
echo "curl http://NEW_SERVER_IP/health/"
echo "curl http://NEW_DOMAIN.com/health/"
echo ""
echo "For detailed instructions, see MIGRATION_GUIDE.md"
