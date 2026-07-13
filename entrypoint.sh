#!/bin/sh

echo "Waiting for PostgreSQL database..."
node src/scripts/esperarBd.js

if [ $? -eq 0 ]; then
  echo "Syncing database schema..."
  npx prisma db push --accept-data-loss
  
  echo "Seeding database..."
  npx prisma db seed
  
  echo "Starting Node.js application..."
  exec npm start
else
  echo "Failed to connect to database. Exiting."
  exit 1
fi
