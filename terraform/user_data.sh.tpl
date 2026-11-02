#!/bin/bash
# Runs ONCE on first boot, as root. Prepares the server for deployments.
dnf install -y docker
systemctl enable --now docker

mkdir -p /opt/task-tracker
cat > /opt/task-tracker/.env <<ENV
DB_HOST=${db_host}
DB_PORT=5432
DB_USER=${db_user}
DB_PASSWORD=${db_password}
DB_NAME=tasks
DB_SSL=true
ENV
chmod 600 /opt/task-tracker/.env
