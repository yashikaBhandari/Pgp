# 🚀 Deployment Guide

This guide covers deploying the Component Generator Platform to production environments.

## 🌐 Deployment Options

### Option 1: Vercel + Railway (Recommended)

#### Frontend (Vercel)
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set framework preset to "Next.js"
   - Configure environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
     ```

#### Backend (Railway)
1. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repo
   - Select the `server` folder as root directory
   - Add environment variables:
     ```
     MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/component-generator
     JWT_SECRET=your-production-jwt-secret-here
     OPENROUTER_API_KEY=your-openrouter-api-key
     AI_MODEL=openai/gpt-4o-mini
     PORT=5000
     NODE_ENV=production
     ```

2. **Configure MongoDB Atlas**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create free cluster
   - Get connection string and add to Railway

### Option 2: Netlify + Heroku

#### Frontend (Netlify)
```bash
# Build and deploy
npm run build
# Drag dist folder to Netlify
```

#### Backend (Heroku)
```bash
# Install Heroku CLI and login
heroku create your-app-name
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set OPENROUTER_API_KEY=your-api-key
git subtree push --prefix server heroku main
```

### Option 3: DigitalOcean App Platform

1. **Create App**
   - Connect GitHub repository
   - Configure two services:
     - Frontend (Node.js, `client` folder)
     - Backend (Node.js, `server` folder)

2. **Environment Variables**
   - Set all required environment variables
   - Configure MongoDB connection

## 🔧 Production Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/component-generator?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-for-production

# AI Service
OPENROUTER_API_KEY=sk-or-v1-your-production-api-key
AI_MODEL=openai/gpt-4o-mini

# Server
PORT=5000
NODE_ENV=production

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

#### Frontend Environment
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

### Database Setup (MongoDB Atlas)

1. **Create Cluster**
   - Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create free M0 cluster
   - Choose closest region

2. **Security Configuration**
   - Create database user
   - Add IP addresses to whitelist (0.0.0.0/0 for public access)
   - Get connection string

3. **Database Optimization**
   ```javascript
   // Create indexes for better performance
   db.sessions.createIndex({ userId: 1, lastAccessed: -1 })
   db.users.createIndex({ email: 1 }, { unique: true })
   ```

### AI API Setup

#### OpenRouter (Recommended)
1. Go to [openrouter.ai](https://openrouter.ai)
2. Create account and get API key
3. Choose model: `openai/gpt-4o-mini` for cost-effectiveness
4. Set rate limits and monitoring

#### Alternative: Direct OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Set usage limits
4. Update environment variables:
   ```env
   OPENAI_API_KEY=your-openai-key
   AI_MODEL=gpt-4o-mini
   ```

## 🔒 Security Checklist

### Backend Security
- [ ] Strong JWT secret (64+ characters)
- [ ] CORS properly configured for production domain
- [ ] Environment variables secured
- [ ] Database connection encrypted
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] HTTPS enforced

### Frontend Security
- [ ] API endpoints use HTTPS
- [ ] Sensitive data not exposed in client
- [ ] XSS protection enabled
- [ ] Content Security Policy configured

### Database Security
- [ ] Strong database passwords
- [ ] IP whitelist configured
- [ ] Regular backups enabled
- [ ] Monitoring and alerts set up

## 📊 Performance Optimization

### Backend Optimization
```javascript
// Add to server.js
const compression = require('compression')
app.use(compression())

// Implement caching
const redis = require('redis')
const client = redis.createClient(process.env.REDIS_URL)
```

### Frontend Optimization
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-domain.com']
  },
  compress: true,
  poweredByHeader: false
}
```

### Database Optimization
- Enable MongoDB Atlas performance advisor
- Create appropriate indexes
- Implement connection pooling
- Use aggregation pipelines for complex queries

## 🔍 Monitoring & Logging

### Error Tracking
```bash
# Install Sentry for error tracking
npm install @sentry/node @sentry/nextjs
```

### Application Monitoring
- **Railway**: Built-in monitoring dashboard
- **Vercel**: Analytics and performance metrics
- **MongoDB Atlas**: Database performance monitoring

### Custom Logging
```javascript
// Backend logging
const winston = require('winston')
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

## 🧪 Testing Production

### Pre-deployment Testing
```bash
# Backend
npm run test
npm run lint

# Frontend
npm run build
npm run lint
```

### Post-deployment Verification
- [ ] Health check endpoint responds
- [ ] User registration works
- [ ] Login/logout functionality
- [ ] Session creation and management
- [ ] Component generation with AI
- [ ] Code export functionality
- [ ] All API endpoints respond correctly

### Load Testing
```bash
# Install and run load testing
npm install -g artillery
artillery quick --count 10 --num 5 https://your-api.com/api/health
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.0.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

## 🚨 Backup Strategy

### Database Backups
```bash
# MongoDB Atlas automatic backups
# Manual backup command
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/component-generator"
```

### Code Backups
- GitHub repository (primary)
- Regular releases with tags
- Environment variable backups (secure storage)

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancers for multiple backend instances
- Implement Redis for session storage
- Consider microservices architecture for large scale

### Vertical Scaling
- Monitor resource usage
- Upgrade server instances as needed
- Optimize database queries

### CDN Integration
```javascript
// next.config.js
module.exports = {
  images: {
    loader: 'cloudinary',
    path: 'https://your-cdn.com/'
  }
}
```

## 🆘 Troubleshooting

### Common Issues
1. **CORS Errors**: Update CORS configuration in backend
2. **Database Connection**: Check MongoDB Atlas whitelist
3. **AI API Limits**: Monitor usage and upgrade plan
4. **Build Failures**: Check Node.js version compatibility

### Debug Commands
```bash
# Check logs
heroku logs --tail -a your-app-name
railway logs

# Database connection test
node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('Connected'))"
```

## 📞 Support

- Check server logs for error details
- Monitor API response times
- Set up alerts for downtime
- Regular security updates

---

**Remember**: Always test in a staging environment before deploying to production!