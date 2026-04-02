#!/bin/bash

# seed-database.sh
# Seeds the MongoDB database with initial data using the project 6 seed script.

set -e

echo "🌱 Seeding database..."

docker compose exec -T app node /workspace/src/seed/seed-database.js

if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully"
    exit 0
else
    echo "❌ Database seeding failed"
    exit 1
fi
