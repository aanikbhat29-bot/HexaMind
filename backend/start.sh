#!/bin/bash

# HexaMind Backend Server Startup Script
# This script starts the Node.js backend server on port 4001

echo "╔════════════════════════════════════════════╗"
echo "║   HexaMind Backend Server Starter           ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js 22 or later"
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "📂 Backend directory: $SCRIPT_DIR"
echo ""

# Check if node_modules exists
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd "$SCRIPT_DIR"
    npm install
    echo ""
fi

# Get local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="192.168.1.37"
fi

echo "✅ Starting HexaMind Backend Server..."
echo "   Local IP: $LOCAL_IP"
echo "   Port: 4001"
echo ""
echo "Access from Android device at: http://$LOCAL_IP:4001"
echo ""
echo "🔐 Demo credentials:"
echo "   Email: demo@hexamind.ai"
echo "   Password: demo123"
echo ""
echo "Press Ctrl+C to stop the server"
echo "════════════════════════════════════════════"
echo ""

cd "$SCRIPT_DIR"
npm start
