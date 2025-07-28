#!/bin/bash

echo "🚀 Component Generator Platform Setup"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd server
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../client
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend dependencies installed"

# Check if .env exists in server
cd ../server
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit server/.env and add your:"
    echo "   - MongoDB connection string"
    echo "   - JWT secret key"
    echo "   - OpenRouter API key (get free at https://openrouter.ai/)"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Configure your API keys in server/.env"
echo "3. Run the application:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   cd server && npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   cd client && npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "🔗 Quick links:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo "   - Health Check: http://localhost:5000/api/health"
echo ""
echo "💡 Need help? Check the README.md for detailed instructions!"