#!/bin/bash

# Function to check if a port is in use
check_port() {
  if lsof -i :$1 > /dev/null 2>&1; then
    echo "Port $1 is already in use. Please stop the process using this port and try again."
    return 1
  fi
  return 0
}

# Check if ports are available
check_port 3000 || exit 1
check_port 5173 || exit 1  # Vite uses port 5173 by default

# Install backend dependencies and start the backend server
echo "Installing backend dependencies..."
cd backend
bun install
echo "Starting backend server..."
bun run dev &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"

# Wait a moment for the backend to start
sleep 2

# Install frontend dependencies and start the frontend server
echo "Installing frontend dependencies..."
cd ../frontend
bun install
echo "Starting frontend server..."
bun run dev &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"

echo "Both servers are running."
echo "Backend on: http://localhost:3000"
echo "Frontend on: http://localhost:5173" # Vite uses port 5173 by default
echo "Press Ctrl+C to stop both servers."

# Cleanup function
cleanup() {
  echo "Stopping servers..."
  kill -9 $BACKEND_PID 2>/dev/null
  kill -9 $FRONTEND_PID 2>/dev/null
  exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Wait for processes to finish
wait 