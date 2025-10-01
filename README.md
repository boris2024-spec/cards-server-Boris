# Cards Server API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.1.0-blue.svg)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.16+-green.svg)](https://mongodb.com)
[![Jest](https://img.shields.io/badge/Jest-29.7-red.svg)](https://jestjs.io)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

Modern Node.js / Express server for managing business cards with user system, JWT authentication, role model, and full compatibility with React frontend.

## 🚀 Features

### 👥 User Management
- **Registration and authentication** with JWT tokens
- **Role system**: Regular, Business, Admin users
- **Automatic assignment of the first user** as administrator
- **Blocking system** after failed login attempts (3 attempts → 24 hours block)
- **Administrative functions** for user management

### 🎯 Business Cards
- **CRUD operations** for business cards
- **Unique 7-digit numbers** (bizNumber) with autogeneration
- **Like system** with atomic toggle mechanism
- **Card blocking** by administrators
- **Search and filter** cards

### 🔒 Security
- **JWT tokens** with configurable expiration time
- **CORS protection** with flexible domain settings
- **Data validation** using Joi
- **Centralized error handling**
- **Logging** of all requests and errors

### 🏗 Architecture
- **Modular structure** by domains (users, cards, auth)
- **Middleware system** for authentication and authorization
- **Unified API response format**
- **Comprehensive testing** (unit + integration)
- **Health-check endpoint** for monitoring

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Installation & Setup](#installation--setup)
3. [Environment Variables](#environment-variables)
4. [API Documentation](#api-documentation)
5. [Project Architecture](#project-architecture)
6. [Testing](#testing)
7. [Frontend Compatibility](#frontend-compatibility)
8. [Deployment](#deployment)

## 🏃‍♂️ Quick Start

```bash
# Clone repository
git clone https://github.com/boris2024-spec/cards-server-Boris.git
cd cards-server-Boris

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start MongoDB (if local)
mongod

# Start in development mode
npm run dev

# Check health
curl http://localhost:3000/health
```

## ⚙️ Installation & Setup

### System Requirements
- **Node.js**: 18.0.0 or higher
- **MongoDB**: 5.0 or higher
- **npm**: 8.0 or higher

### Step-by-step installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup MongoDB**
   ```bash
   # Local installation (Ubuntu/Debian)
   sudo apt install mongodb-server
   
   # Or via Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

3. **Create environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file according to your settings
   ```

4. **Start the server**
   ```bash
   # Development mode with hot-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
# Basic server settings
PORT=3000
NODE_ENV=development

# MongoDB database
MONGODB_URI=mongodb://127.0.0.1:27017/cards_app

# JWT settings
JWT_SECRET=your_super_secret_jwt_key_change_me_in_production
JWT_EXPIRES=1h

# Admin settings
ADMIN_REG_CODE=your_admin_registration_code

# Business number settings
BIZNUM_MAX_RETRIES=5

# CORS settings (separator: comma)
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5500,http://localhost:3001

# Logging
LOG_LEVEL=info
```

### Variable descriptions

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/cards_app` | Yes |
| `JWT_SECRET` | JWT secret key | - | Yes |
| `JWT_EXPIRES` | JWT token lifetime | `1h` | No |
| `ADMIN_REG_CODE` | Admin registration code | - | No |
| `CORS_ORIGINS` | Allowed domains for CORS | `localhost:5173,127.0.0.1:5500` | No |

## 📚 API Documentation

### Response Format

All API responses follow a unified format:

**Success response:**
```json
{
  "status": "success",
  "data": {
    // operation result
  }
}
```

**Error response:**
```json
{
  "status": "error",
  "error": {
    "message": "Error description",
    "details": [
      {
        "path": "field_name",
        "message": "Detailed field error description"
      }
    ]
  }
}
```

### 🔐 Authentication

The server supports two ways to pass JWT token:

**Recommended method (Bearer Token):**
```javascript
fetch('/api/cards', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Backward compatibility:**
```javascript
fetch('/api/cards', {
  headers: {
    'x-auth-token': token
  }
});
```

### 👥 Users API

#### POST /users - Register user
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "name": {
      "first": "John",
      "middle": "M",
      "last": "Doe"
    },
    "phone": "050-123-4567",
    "image": {
      "url": "https://example.com/avatar.jpg",
      "alt": "User avatar"
    },
    "address": {
      "state": "IL",
      "country": "Israel",
      "city": "Tel Aviv",
      "street": "Herzl",
      "houseNumber": 123,
      "zip": 12345
    },
    "isBusiness": true,
    "adminCode": "optional_admin_code"
  }'
```

#### POST /users/login - Login
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

#### GET /users - Get all users (Admin only)
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### GET /users/:id - Get user by ID
```bash
curl -X GET http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PUT /users/:id - Update user
```bash
curl -X PUT http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": {
      "first": "Updated",
      "last": "Name"
    }
  }'
```

#### DELETE /users/:id - Delete user
```bash
curl -X DELETE http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PATCH /users/:id/block - Block user (Admin only)
```bash
curl -X PATCH http://localhost:3000/users/USER_ID/block \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PATCH /users/:id/unblock - Unblock user (Admin only)
```bash
curl -X PATCH http://localhost:3000/users/USER_ID/unblock \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PATCH /users/reset-login-attempts - Reset login attempts (Admin only)
```bash
curl -X PATCH http://localhost:3000/users/reset-login-attempts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### 🎯 Cards API

#### GET /cards - Get all cards
```bash
curl -X GET http://localhost:3000/cards
```

#### GET /cards/my-cards - Get current user's cards
```bash
curl -X GET http://localhost:3000/cards/my-cards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### GET /cards/:id - Get card by ID
```bash
curl -X GET http://localhost:3000/cards/CARD_ID
```

#### POST /cards - Create card (Business user only)
```bash
curl -X POST http://localhost:3000/cards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Business",
    "subtitle": "Professional Services",
    "description": "We provide excellent services",
    "phone": "050-123-4567",
    "email": "business@example.com",
    "web": "https://mybusiness.com",
    "image": {
      "url": "https://example.com/business.jpg",
      "alt": "Business logo"
    },
    "address": {
      "state": "IL",
      "country": "Israel",
      "city": "Tel Aviv",
      "street": "Business St",
      "houseNumber": 456,
      "zip": 54321
    }
  }'
```

#### PUT /cards/:id - Update card
```bash
curl -X PUT http://localhost:3000/cards/CARD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Business Name"
  }'
```

#### DELETE /cards/:id - Delete card
```bash
curl -X DELETE http://localhost:3000/cards/CARD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PATCH /cards/:id/like - Like/unlike card
```bash
curl -X PATCH http://localhost:3000/cards/CARD_ID/like \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PATCH /cards/:id/bizNumber - Change card business number
```bash
curl -X PATCH http://localhost:3000/cards/CARD_ID/bizNumber \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PATCH /cards/:id/block - Block card (Admin only)
```bash
curl -X PATCH http://localhost:3000/cards/CARD_ID/block \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PATCH /cards/:id/unblock - Unblock card (Admin only)
```bash
curl -X PATCH http://localhost:3000/cards/CARD_ID/unblock \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 🔍 Utility Endpoints

#### GET /health - Server health check
```bash
curl -X GET http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "uptime": 123.45,
  "db": "connected"
}
```

#### GET /ping - Simple availability check
```bash
curl -X GET http://localhost:3000/ping
```

Response: `pong`

## 🏗 Project Architecture

### Directory Structure

```
cards-server-Boris/
├── 📁 auth/                    # Authentication system
│   ├── providers/
│   │   └── jwtProvider.js      # JWT utilities
│   └── services/
│       └── authService.js      # Authentication middleware
├── 📁 cards/                   # Cards module
│   ├── middlewares/
│   │   └── cardPermissions.js  # Access control
│   ├── models/
│   │   └── Card.js             # Mongoose card model
│   ├── routes/
│   │   └── cardsController.js  # Card routes
│   ├── services/
│   │   ├── bizNumberService.js # Business number generation
│   │   ├── cardsDataService.js # Database operations
│   │   ├── cardsService.js     # Business logic
│   │   └── dtoService.js       # DTO transformations
│   └── validation/
│       ├── cardValidationSchema.js    # Joi schemas
│       └── cardValidationService.js   # Validation service
├── 📁 users/                   # Users module
│   ├── helpers/
│   │   └── bcrypt.js           # Password hashing
│   ├── models/
│   │   ├── LoginAttempt.js     # Login attempts model
│   │   └── User.js             # Mongoose user model
│   ├── routes/
│   │   └── usersController.js  # User routes
│   ├── services/
│   │   ├── loginAttemptService.js    # Blocking system
│   │   ├── usersDataService.js       # Database operations
│   │   └── usersService.js           # Business logic
│   └── validation/
│       └── userValidationSchema.js   # Joi schemas
├── 📁 middlewares/             # Common middleware
│   ├── errorHandler.js         # Centralized error handling
│   ├── logger.js               # Request logging
│   └── response.js             # Response unification
├── 📁 helpers/                 # Utility helpers
│   ├── mongooseValidators.js   # Mongoose validators
│   └── submodels/              # Submodels
│       ├── Address.js          # Address schema
│       ├── Image.js            # Image schema
│       └── Name.js             # Name schema
├── 📁 tests/                   # Tests
│   ├── app.ping.test.js        # Ping endpoint test
│   ├── auth.header.test.js     # Authentication test
│   ├── card.blocking.test.js   # Card blocking test
│   ├── card.validation.messages.test.js  # Validation test
│   ├── health.test.js          # Health endpoint test
│   ├── integration.flow.test.js          # Integration tests
│   └── user.blocking.test.js   # User blocking test
├── 📁 config/                  # Configuration
├── 📁 DB/                      # Database utilities
├── 📁 logs/                    # Application logs
├── 📁 public/                  # Static files
└── 📁 router/                  # Main router
```

### Architecture Principles

1. **Modularity**: Each domain (users, cards, auth) is isolated
2. **Layered Architecture**: Controller → Service → DataService → Model
3. **Middleware System**: Reusable components for authorization, logging, errors
4. **Validation**: Double validation (Joi + Mongoose)
5. **Error Handling**: Centralized processing with detailed messages

### Role Model

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Regular User** | Standard user | View cards, likes |
| **Business User** | Business user | + Create/edit own cards |
| **Admin** | Administrator | + Manage all users and cards |

### Data Models

#### User Schema
```javascript
{
  _id: ObjectId,
  email: String,               // unique, email validation
  password: String,            // bcrypt hash
  name: {
    first: String,             // required
    middle: String,            // optional
    last: String               // required
  },
  phone: String,               // phone validation
  image: {
    url: String,               // image URL
    alt: String                // alt text
  },
  address: {
    state: String,
    country: String,           // required
    city: String,              // required
    street: String,            // required
    houseNumber: Number,       // required
    zip: Number                // optional
  },
  isAdmin: Boolean,            // default false
  isBusiness: Boolean,         // default false
  isBlocked: Boolean,          // default false
  createdAt: Date              // automatic
}
```

#### Card Schema
```javascript
{
  _id: ObjectId,
  title: String,               // required
  subtitle: String,            // required
  description: String,         // required, up to 1024 chars
  phone: String,               // phone validation
  email: String,               // email validation
  web: String,                 // URL validation
  image: {
    url: String,               // image URL
    alt: String                // alt text
  },
  address: {                   // same as User
    state: String,
    country: String,
    city: String,
    street: String,
    houseNumber: Number,
    zip: Number
  },
  bizNumber: Number,           // unique 7-digit number
  likes: [String],             // array of user IDs
  isBlocked: Boolean,          // default false
  createdAt: Date,             // automatic
  user_id: String              // card owner ID
}
```

#### LoginAttempt Schema
```javascript
{
  email: String,               // user email
  attempts: Number,            // number of attempts
  blockedUntil: Date,          // blocking end time
  lastAttempt: Date            // last attempt time
}
```

## 🧪 Testing

### Running Tests

```bash
# All tests
npm test

# Specific tests
npm test -- --testPathPattern=user.blocking
npm test -- --testPathPattern=integration.flow
npm test -- --testPathPattern=card.validation

# With coverage
npm test -- --coverage

# In watch mode
npm test -- --watch
```

### Test Structure

1. **Unit tests**: Testing individual modules
   - `card.validation.messages.test.js` - card validation
   - `auth.header.test.js` - authentication

2. **Integration tests**: Complete scenarios
   - `integration.flow.test.js` - full user journey
   - `user.blocking.test.js` - blocking system
   - `card.blocking.test.js` - card blocking

3. **API tests**: Endpoint verification
   - `app.ping.test.js` - basic availability
   - `health.test.js` - health check

### Test Scenarios

#### Integration Test (integration.flow.test.js)
1. User registration
2. Login and JWT retrieval
3. Business card creation
4. Card liking
5. Like toggle (unlike)
6. Final state verification

#### User Blocking Test (user.blocking.test.js)
1. 3 failed login attempts
2. Automatic 24-hour block
3. Error message verification
4. Administrative reset

### Demo Scripts

```bash
# Windows PowerShell user blocking demo
.\demo_user_blocking.ps1

# Unix/Linux user blocking demo
./demo_user_blocking.sh
```

## 🌐 Frontend Compatibility

### React Frontend Compatibility

The server is 100% compatible with React frontend:
- **Repository**: https://github.com/boris2024-spec/cards-proj-Boris-main-main
- **Technologies**: React 19.1.0, MUI 7.1.0, Vite 6, Axios

### API Compatibility

✅ **Full compatibility of all endpoints:**
- Users API: registration, login, CRUD operations
- Cards API: creation, editing, likes
- Admin API: user and card blocking

✅ **Identical data structures:**
- User and Card models fully correspond
- Same validation rules (Joi)
- Matching response formats

✅ **Authentication:**
- JWT tokens work identically
- Support for both header formats
- Synchronized role model

### CORS Settings for Frontend

```env
# For development
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5500

# For production
CORS_ORIGINS=https://your-frontend-domain.com,https://app.example.com
```

### Frontend Setup

In the frontend project, create `.env.local`:
```env
VITE_API_BASE=http://localhost:3000
# Or for production:
# VITE_API_BASE=https://your-backend-domain.com
```

## 🔒 Security System

### JWT Tokens
- **Algorithm**: HS256
- **Payload**: `{ _id, isBusiness, isAdmin }`
- **Lifetime**: Configurable via `JWT_EXPIRES`
- **Secret**: Must change `JWT_SECRET` in production

### Login Blocking System
- **Attempt limit**: 3 failed attempts
- **Block duration**: 24 hours
- **Reset**: Automatic via TTL or administrative
- **Monitoring**: Logging of all attempts

### Data Validation
- **Frontend validation**: Joi schemas
- **Backend validation**: Mongoose + Joi
- **Sanitization**: Automatic removal of extra fields
- **Secure passwords**: bcrypt with salt

### CORS Protection
- **Configurable domains**: Via environment variables
- **Credentials**: Support for authorization headers
- **Methods**: Full REST API support

## 📊 Monitoring and Logging

### Health Check
```bash
curl http://localhost:3000/health
```

Response includes:
- Server status
- Uptime
- Database connection status
- HTTP status 200 (OK) or 503 (Service Unavailable)

### Logging

**Morgan middleware** for HTTP requests:
```
GET /cards 200 45ms - 1.2kb
POST /users/login 401 12ms - 0.5kb
```

**Application logs** in `logs/` directory:
- `app.log` - current logs
- `app-YYYY-MM-DD.log` - archived daily logs

**Logging levels**:
- `info` - normal operations
- `warn` - warnings
- `error` - application errors
- `debug` - debug information

### Metrics for Monitoring

Recommended metrics for production:
- Response time per endpoint
- Error rate (4xx, 5xx)
- Database connection status
- JWT token validation errors
- Failed login attempts
- Active user sessions

## 🚀 Deployment

### Local Development

1. **MongoDB Setup**:
   ```bash
   # Docker option
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or local installation
   brew install mongodb-community    # macOS
   sudo apt install mongodb-server   # Ubuntu
   ```

2. **Start in dev mode**:
   ```bash
   npm run dev
   ```

3. **Check**:
   ```bash
   curl http://localhost:3000/health
   ```

### Production Deployment

#### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  cards-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/cards_app
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
    
  mongo:
    image: mongo:5
    volumes:
      - mongo_data:/data/db
    
volumes:
  mongo_data:
```

**Start:**
```bash
docker-compose up -d
```

#### Heroku Deployment

```bash
# Create application
heroku create your-cards-server

# Add MongoDB (MongoAtlas addon)
heroku addons:create mongolab:sandbox

# Set variables
heroku config:set JWT_SECRET=your_production_jwt_secret
heroku config:set ADMIN_REG_CODE=your_admin_code
heroku config:set CORS_ORIGINS=https://your-frontend.herokuapp.com

# Deploy
git push heroku main
```

#### VPS/Cloud Deployment

```bash
# PM2 for process management
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cards-server',
    script: 'server.js',
    instances: 'max',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start in production
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Production Environment Variables

```env
# Production settings
NODE_ENV=production
PORT=3000

# Security
JWT_SECRET=your_very_long_and_secure_jwt_secret_here
ADMIN_REG_CODE=super_secure_admin_registration_code

# Database (MongoDB Atlas recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cards_app

# CORS for production
CORS_ORIGINS=https://your-frontend.com,https://app.your-domain.com

# Optional settings
LOG_LEVEL=warn
BIZNUM_MAX_RETRIES=10
```

## 🛠 Additional Utilities

### Clear Database
```bash
node clear_db.js
```

### Seed Test Data
```bash
node seed.js
```

### Testing Scripts

**package.json scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "powershell -Command \"$env:NODE_ENV='test'; node --experimental-vm-modules ./node_modules/jest/bin/jest.js --detectOpenHandles\"",
    "test:watch": "npm test -- --watch",
    "test:coverage": "npm test -- --coverage",
    "lint": "eslint .",
    "seed": "node seed.js",
    "clear-db": "node clear_db.js"
  }
}
```

## 📋 TODO / Future Development

### Short-term Improvements
- [ ] **Refresh tokens** for automatic JWT renewal
- [ ] **Email change endpoint** - separate endpoint for email changes
- [ ] **Swagger/OpenAPI** documentation
- [ ] **Rate limiting** for all endpoints
- [ ] **Soft delete** instead of hard deletion

### Medium-term Goals
- [ ] **Redis** integration for caching and sessions
- [ ] **Email notifications** for blocking/registration
- [ ] **Image upload** support for avatars and cards
- [ ] **Search API** for card searching
- [ ] **Pagination** for large lists

### Long-term Plans
- [ ] **Microservices** architecture
- [ ] **GraphQL** API in addition to REST
- [ ] **Real-time** notifications via WebSocket
- [ ] **Analytics** and usage metrics
- [ ] **API versioning** for backward compatibility

### Security
- [ ] **2FA** two-factor authentication
- [ ] **OAuth** integration (Google, Facebook)
- [ ] **IP-based blocking** in addition to email blocking
- [ ] **CAPTCHA** integration after multiple failures
- [ ] **Security headers** (extended Helmet.js configuration)

### DevOps
- [ ] **CI/CD pipeline** (GitHub Actions)
- [ ] **Automated testing** in CI
- [ ] **Code quality** checks (SonarQube)
- [ ] **Performance monitoring** (New Relic, DataDog)
- [ ] **Automated backups** for MongoDB

## 🤝 Contributing

### How to Contribute

1. **Fork** the repository
2. Create a **feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. Open a **Pull Request**

### Code Standards

- **ESLint** configuration in `eslint.config.js`
- **Conventional Commits** for commit messages
- **Jest** for all new features
- **JSDoc** comments for public APIs

### Testing Before PR

```bash
# Run all tests
npm test

# Check linter
npm run lint

# Type checking (if using TypeScript)
npm run type-check
```

## 📄 License

This project is licensed under the [ISC License](LICENSE).

## 👥 Authors and Acknowledgments

- **Boris** - Main developer
- **Full Stack Course Team** - Mentorship and support

### Acknowledgments
- **Express.js** team for excellent framework
- **MongoDB** for reliable database
- **Jest** for quality testing
- **Joi** for powerful validation

## 📞 Support

If you have questions or issues:

1. **GitHub Issues**: [Create issue](https://github.com/boris2024-spec/cards-server-Boris/issues)
2. **Email**: boris2024.spec@example.com
3. **Documentation**: Read this README and code comments

### Frequently Asked Questions (FAQ)

**Q: How to reset user password?**
A: In current version only through database. Password reset endpoint is planned.

**Q: Can I change the number of login attempts?**
A: Yes, modify the `MAX_ATTEMPTS` constant in `loginAttemptService.js`.

**Q: How to add new fields to cards?**
A: Update schema in `Card.js`, add validation in `cardValidationSchema.js` and tests.

**Q: Is cluster mode supported?**
A: Yes, the server is stateless and can work in cluster with external MongoDB.

---

**🎯 Cards Server API - Professional solution for managing business cards**

*Created with ❤️ for the developer community*
