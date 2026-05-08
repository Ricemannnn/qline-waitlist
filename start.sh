#!/bin/bash

# Start the backend server in the background
echo "Starting backend server..."
cd server
npm start > ../server.log 2>&1 &
cd ..

# Start the frontend client
echo "Starting frontend client..."
cd client
npm run dev -- --host 0.0.0.0 --port 5173
