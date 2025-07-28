# 🚀 Component & Multi-Component Generator Platform

A powerful AI-driven micro-frontend playground where authenticated users can iteratively generate, preview, tweak, and export React components with full chat history and code persistence across sessions.

## 🌟 Features

### ✅ Core Requirements (Mandatory)

- **🔐 Authentication & Persistence**
  - Email/password signup and login
  - JWT-based session management
  - Load previous sessions with full chat history and generated code
  - Create new sessions with empty slate

- **💬 Conversational UI for Generation**
  - Side-panel chat with text and image input support
  - Real-time AI-powered component generation
  - Live component rendering in central viewport
  - Session-based chat history preservation

- **📝 Code Inspection & Export**
  - Syntax-highlighted code tabs (JSX/TSX and CSS)
  - Copy to clipboard functionality
  - Download complete component as ZIP file
  - Package.json and README generation

### 🎯 Advanced Features (Optional/Good to Have)

- **🔄 Iterative Refinement**
  - Component modification through chat prompts
  - Delta-based updates to existing components
  - Component version history tracking

- **💾 Statefulness & Resume**
  - Auto-save after every chat interaction
  - Complete session restoration on login/reload
  - Persistent component preview state

- **🎨 Live Preview & Export**
  - Secure iframe-based component rendering
  - Real-time updates without full page refresh
  - Component isolation and error handling

## 🛠️ Tech Stack

### Backend
- **Framework**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **AI Integration**: OpenRouter API (supports multiple LLM providers)
- **File Handling**: Multer for image uploads

### Frontend
- **Framework**: React with Next.js 15
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence
- **Code Editor**: Monaco Editor with TypeScript support
- **UI Components**: Custom components with Headless UI patterns

### Development & Deployment
- **Language**: TypeScript for type safety
- **Package Manager**: npm
- **Development**: Hot reload with Turbopack
- **Export**: ZIP generation with JSZip

## 📦 Project Structure

```
├── server/                 # Backend API
│   ├── models/            # MongoDB models (User, Session)
│   ├── routes/            # API routes (auth, sessions)
│   ├── services/          # AI service integration
│   └── server.js          # Express server setup
├── client/                # Frontend application
│   ├── src/app/
│   │   ├── components/    # Reusable UI components
│   │   ├── store/         # Zustand state management
│   │   ├── dashboard/     # Main dashboard page
│   │   ├── login/         # Authentication pages
│   │   └── signup/
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or cloud)
- AI API key (OpenRouter or OpenAI)

### 1. Backend Setup

```bash
cd server
npm install
```

Create `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/component-generator
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
OPENROUTER_API_KEY=your-openrouter-api-key
AI_MODEL=openai/gpt-4o-mini
PORT=5000
```

Start the server:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install --legacy-peer-deps
```

Start the development server:
```bash
npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 🏗️ Architecture & Key Decisions

### State Management Strategy
- **Zustand** for client-side state with persistence
- **MongoDB** for server-side session and user data
- Real-time synchronization between frontend and backend

### AI Integration
- **OpenRouter API** for LLM access (cost-effective with multiple providers)
- Structured prompts for consistent component generation
- Error handling with fallback components
- Context-aware refinements using chat history

### Security & Sandboxing
- **JWT authentication** with secure token handling
- **iframe sandboxing** for component preview isolation
- **Input validation** and sanitization
- **CORS configuration** for secure API access

### Component Generation Process
1. User submits prompt (text + optional image)
2. AI service processes request with context
3. Generated JSX/CSS returned as structured JSON
4. Component rendered in secure iframe
5. Code displayed in syntax-highlighted editor
6. Session automatically saved to database

### Export System
- **ZIP generation** with complete project structure
- **Package.json** with required dependencies
- **README** with usage instructions
- **TypeScript support** for generated components

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login

### Sessions
- `GET /api/sessions` - Get user's sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get specific session
- `PATCH /api/sessions/:id` - Update session name
- `DELETE /api/sessions/:id` - Delete session
- `POST /api/sessions/:id/messages` - Send message and generate component

### Health Check
- `GET /api/health` - Server status and configuration

## 🎯 Key Features in Detail

### AI-Powered Generation
- **Smart Prompting**: Optimized prompts for React component generation
- **Context Awareness**: Uses chat history for better refinements
- **Error Handling**: Graceful fallback for generation failures
- **Multi-modal Input**: Support for text and image prompts

### Session Management
- **Auto-save**: Every interaction automatically persisted
- **Resume Capability**: Complete state restoration across sessions
- **Version Control**: Component history tracking
- **Efficient Loading**: Optimized data fetching and caching

### Code Editor
- **Monaco Editor**: Full-featured VS Code-like experience
- **TypeScript Support**: IntelliSense and type checking
- **Syntax Highlighting**: Language-specific highlighting
- **Read-only Mode**: Secure code inspection

### Component Preview
- **Iframe Isolation**: Secure component rendering
- **Real-time Updates**: Hot reload functionality
- **Error Boundaries**: Graceful error handling
- **Responsive Design**: Mobile-friendly previews

## 🎨 Design Principles

### User Experience
- **Intuitive Interface**: Clean, modern design with clear navigation
- **Real-time Feedback**: Loading states and progress indicators
- **Error Prevention**: Validation and helpful error messages
- **Accessibility**: Keyboard navigation and screen reader support

### Performance
- **Optimized Loading**: Code splitting and lazy loading
- **Efficient State**: Minimal re-renders with Zustand
- **Smart Caching**: API response caching where appropriate
- **Bundle Optimization**: Tree shaking and compression

### Scalability
- **Modular Architecture**: Reusable components and services
- **Database Optimization**: Indexed queries and pagination
- **API Design**: RESTful endpoints with consistent patterns
- **Deployment Ready**: Environment-based configuration

## 🚀 Deployment

### Backend Deployment
1. Configure production environment variables
2. Set up MongoDB Atlas or self-hosted MongoDB
3. Deploy to Heroku, Railway, or DigitalOcean
4. Configure CORS for production domain

### Frontend Deployment
1. Build the Next.js application
2. Deploy to Vercel, Netlify, or similar platform
3. Configure environment variables for API URL
4. Set up custom domain if needed

### Environment Variables

**Backend (.env):**
```env
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
OPENROUTER_API_KEY=your-api-key
NODE_ENV=production
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=your-backend-api-url
```

## 🧪 Testing the Application

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Session creation and management
- [ ] Component generation with text prompts
- [ ] Image upload and processing
- [ ] Component refinement through chat
- [ ] Code viewing and copying
- [ ] ZIP download functionality
- [ ] Session persistence across browser refreshes

### Example Prompts to Try
- "Create a modern login form with email and password fields"
- "Build a product card component with image, title, price, and buy button"
- "Make a responsive navigation bar with logo and menu items"
- "Create a dashboard widget showing statistics with charts"

## 🔮 Future Enhancements

### Interactive Property Editor (Bonus)
- Element selection and property panels
- Real-time visual editing
- Two-way binding between UI and code

### Chat-Driven Overrides (Bonus)
- Element-specific modification commands
- Targeted styling updates
- Advanced component composition

### Additional Features
- **Component Library**: Save and reuse generated components
- **Team Collaboration**: Share sessions between users
- **Component Testing**: Automated testing generation
- **Design System Integration**: Brand-specific component generation
- **Advanced Export**: Multiple framework support (Vue, Angular)

## 🐛 Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure MongoDB is running and URI is correct
2. **AI API**: Verify API key and check rate limits
3. **CORS Errors**: Configure CORS settings for your domain
4. **Build Errors**: Check Node.js version compatibility

### Support
For issues and questions, check the error logs and ensure all environment variables are properly configured.

## 📄 License

This project is built as an educational demonstration of AI-powered development tools and modern web architecture patterns.

---

**Built with ❤️ for the AI-powered development community**
