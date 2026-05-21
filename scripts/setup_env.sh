#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Checking environment files and creating defaults..."

# Copy server .env.example if missing
if [ ! -f server/.env ]; then
  if [ -f server/.env.example ]; then
    cp server/.env.example server/.env
    echo "Created server/.env from example"
  else
    cat > server/.env <<EOF
JWT_SECRET=super-secret-jwt-key
FRONTEND_URL=http://localhost:4173
PORT=4001
MONGODB_URI=mongodb://mongodb:27017/ai-edu-platform
OLLAMA_URL=http://localhost:11434
REDIS_URL=redis://localhost:6379
EOF
    echo "Created server/.env with defaults"
  fi
fi

# Create mobile .env if missing; attempt to detect LAN IP
if [ ! -f apps/mobile/.env ]; then
  LOCAL_IP="127.0.0.1"
  # Try ip route
  if command -v ip >/dev/null 2>&1; then
    LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++){if($i=="src"){print $(i+1); exit}}}') || true
  fi
  # fallback to hostname -I
  if [ -z "$LOCAL_IP" ]; then
    if command -v hostname >/dev/null 2>&1; then
      LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}') || true
    fi
  fi
  if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=127.0.0.1
  fi
  cat > apps/mobile/.env <<EOF
LOCAL_API_URL=http://${LOCAL_IP}:4001
EOF
  echo "Created apps/mobile/.env pointing to http://${LOCAL_IP}:4001"
fi

# Quick health check for Ollama
echo "Checking Ollama at http://localhost:11434..."
if command -v curl >/dev/null 2>&1; then
  if curl --silent --fail http://localhost:11434/api/models >/dev/null 2>&1; then
    echo "Ollama appears online at http://localhost:11434"
  else
    echo "Ollama not responding on http://localhost:11434"
    echo "Attempting to start ollama via docker-compose..."
    docker compose up -d ollama || true
    echo "Waiting 5s for ollama to initialize..."
    sleep 5
    if curl --silent --fail http://localhost:11434/api/models >/dev/null 2>&1; then
      echo "Ollama started successfully"
    else
      echo "Ollama still unavailable. To enable AI features, ensure Ollama is installed locally or accessible at http://localhost:11434"
    fi
  fi
else
  echo "curl not available; cannot probe Ollama. Please ensure Ollama is running at http://localhost:11434"
fi

# Optional: attempt to pull llama3 model using ollama CLI if present (best-effort)
if command -v ollama >/dev/null 2>&1; then
  echo "ollama CLI available — attempting to pull llama3 model"
  ollama pull llama3 || true
else
  echo "ollama CLI not found; skipping model pull"
fi

echo "Environment setup complete. You may now run: docker compose up -d --build"
