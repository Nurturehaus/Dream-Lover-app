#!/bin/bash

# Start Expo web and Playwright MCP concurrently
# This script allows you to run the app and have Playwright MCP access to it

echo "🚀 Starting CareSync with Playwright MCP integration..."

# Kill any existing processes on ports 8081
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up processes..."
    kill $(jobs -p) 2>/dev/null || true
    exit
}

# Set up cleanup on script termination
trap cleanup SIGINT SIGTERM

# Start Expo web server in the background
echo "🌐 Starting Expo web server on port 8081..."
npm run web:test &
EXPO_PID=$!

# Wait for Expo to be ready
echo "⏳ Waiting for Expo web server to be ready..."
sleep 10

# Check if Expo is running
if curl -s http://localhost:8081 >/dev/null; then
    echo "✅ Expo web server is running at http://localhost:8081"
else
    echo "❌ Failed to start Expo web server"
    kill $EXPO_PID 2>/dev/null || true
    exit 1
fi

# Start Playwright MCP server
echo "🎭 Starting Playwright MCP server..."
echo "   You can now use 'Use playwright mcp to open a browser to http://localhost:8081' in Claude Code"
echo ""
echo "Available MCP commands:"
echo "  - Use playwright mcp to open a browser to http://localhost:8081"
echo "  - Use playwright mcp to take a screenshot of the current page"
echo "  - Use playwright mcp to click on [selector]"
echo "  - Use playwright mcp to fill [selector] with [text]"
echo "  - Use playwright mcp to navigate to [url]"
echo ""
echo "🎯 Your app is now ready for Playwright MCP automation!"
echo "   Press Ctrl+C to stop all services"

# Keep the script running
wait