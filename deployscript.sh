#!/bin/bash

# Exit on error
set -e

# Define colors and styles
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Clear the screen
clear

# Print header
echo -e "${BOLD}${BLUE}"
echo "┌─────────────────────────────────────────────┐"
echo "│                                             │"
echo "│          I2T-BACKEND DEPLOYMENT             │"
echo "│                                             │"
echo "└─────────────────────────────────────────────┘"
echo -e "${NC}"

# Change to the project directory if needed
# cd /path/to/I2T-backend

# Function for printing step information
print_step() {
  echo -e "\n${YELLOW}[$(date '+%H:%M:%S')]${NC} ${BOLD}$1${NC}"
  echo -e "${BLUE}────────────────────────────────────────────────${NC}"
}

# Function for printing success messages
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function for printing in-progress messages
print_progress() {
  echo -e "  ${BLUE}→ $1${NC}"
}

# Start deployment process
print_step "STEP 1: Fetching latest changes from git"
print_progress "Running git fetch..."
git fetch
print_success "Repository information updated"

print_step "STEP 2: Pulling latest changes"
print_progress "Running git pull..."
git pull
print_success "Latest code pulled from repository"

print_step "STEP 3: Building Docker containers"
print_progress "Building with no cache (this may take a while)..."
docker compose build --no-cache
print_success "Docker images built successfully"

print_step "STEP 4: Stopping current containers"
print_progress "Running docker compose down..."
docker compose down
print_success "Containers stopped successfully"

print_step "STEP 5: Starting updated containers"
print_progress "Running docker compose up in detached mode..."
docker compose up -d
print_success "Containers started successfully"

# Print completion message
echo -e "\n${BOLD}${GREEN}"
echo "┌─────────────────────────────────────────────┐"
echo "│                                             │"
echo "│      DEPLOYMENT COMPLETED SUCCESSFULLY      │"
echo "│                                             │"
echo "└─────────────────────────────────────────────┘"
echo -e "${NC}"
echo -e "Deployed at: ${BOLD}$(date)${NC}\n"