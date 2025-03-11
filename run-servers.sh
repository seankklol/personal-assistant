#!/bin/bash

# Colors for console output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Store the root directory
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${BLUE}Starting servers for AI Assistant...${NC}"

# Function to cleanup child processes when script exits
cleanup() {
  echo -e "\n${RED}Stopping all servers...${NC}"
  kill $(jobs -p) 2>/dev/null
  exit 0
}

# Setup trap to catch SIGINT (Ctrl+C) and run cleanup
trap cleanup SIGINT

# Check if required directories exist
if [ ! -d "$ROOT_DIR/frontend" ]; then
  echo -e "${RED}Error: Frontend directory not found.${NC}"
  exit 1
fi

if [ ! -d "$ROOT_DIR/backend" ]; then
  echo -e "${RED}Error: Backend directory not found.${NC}"
  exit 1
fi

# Start Backend Server
echo -e "${GREEN}Starting Backend Server...${NC}"
cd "$ROOT_DIR/backend" && PORT=3001 bun --watch src/index.ts &
BACKEND_PID=$!

# Wait a moment to allow backend to start
sleep 2

# Start Frontend Server
echo -e "${GREEN}Starting Frontend Server...${NC}"
cd "$ROOT_DIR/frontend" && bun run dev &
FRONTEND_PID=$!

# Watch both processes
echo -e "${BLUE}All servers started. Press Ctrl+C to stop all servers.${NC}"
echo -e "${GREEN}Backend running on http://localhost:3001${NC}"
echo -e "${GREEN}Frontend running on http://localhost:5173${NC}"

# Wait for both processes to finish
wait $BACKEND_PID $FRONTEND_PID 