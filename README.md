# Elysia.js Example Backend API

A comprehensive backend API built with **Elysia.js** featuring authentication, user management, task management, and more. This project demonstrates modern backend development practices with TypeScript, JWT authentication, and automatic API documentation.

## 🚀 Features

- **Fast & Modern**: Built with Elysia.js and Bun runtime
- **TypeScript**: Full type safety and excellent developer experience
- **Authentication**: JWT-based authentication with secure password hashing
- **CRUD Operations**: Complete user and task management
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **CORS Support**: Cross-origin resource sharing enabled
- **Validation**: Request validation with detailed error messages
- **Pagination**: Built-in pagination for list endpoints
- **Search & Filtering**: Advanced search and filtering capabilities
- **Docker Ready**: Simple Docker setup for production deployment
- **Health Checks**: Built-in health monitoring and testing

## ⚡ Quick Start

### Development
```bash
# Clone repository
git clone https://github.com/codewithwan/learn-elysia-js.git
cd learn-elysia-js

# Install dependencies
bun install

# Start development server
bun dev
```

Your API will be available at:
- **API**: http://localhost:3000
- **Documentation**: http://localhost:3000/swagger

### Production
```bash
# Edit production environment
# Edit .env.production with your values

# Deploy with Docker
docker-compose --env-file .env.production up -d --build
```

## 📚 API Documentation

Access the interactive API documentation at: **http://localhost:3000/swagger**

### Available Endpoints

#### Health Check
- `GET /health` - Basic health check
- `GET /health/ping` - Simple ping endpoint
- `GET /health/status` - Service status information

#### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user info
- `POST /auth/refresh` - Refresh JWT token

#### Users
- `GET /users` - Get all users (paginated)
- `GET /users/:id` - Get user by ID
- `PUT /users/profile` - Update user profile (authenticated)
- `DELETE /users/account` - Delete user account (authenticated)
- `GET /users/stats` - Get user statistics

#### Tasks
- `GET /tasks` - Get all tasks (with filtering and pagination)
- `GET /tasks/:id` - Get task by ID
- `POST /tasks` - Create new task (authenticated)
- `PUT /tasks/:id` - Update task (authenticated)
- `DELETE /tasks/:id` - Delete task (authenticated)
- `GET /tasks/my/tasks` - Get current user's tasks (authenticated)
- `GET /tasks/stats` - Get task statistics

## 🏗️ Project Structure

```
src/
├── index.ts           # Main application entry point
├── config/            # Configuration management
│   └── index.ts       # Environment and app config
├── routes/            # Route modules
│   ├── auth.ts        # Authentication routes
│   ├── users.ts       # User management routes
│   ├── tasks.ts       # Task management routes
│   └── health.ts      # Health check routes
├── types/             # TypeScript type definitions
│   └── index.ts       # Shared types
└── utils/             # Utility functions
    ├── auth.ts        # Authentication helpers
    ├── pagination.ts  # Pagination utilities
    └── dataStore.ts   # Data management

# Development files
package.json          # Dependencies and scripts
bun.lockb            # Lock file
.env                 # Development environment

# Production files
Dockerfile           # Production Docker build
docker-compose.yml   # Docker services configuration
docker-entrypoint.sh # Docker startup script
.env.production      # Production environment file
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Documentation**: http://localhost:3000/swagger
- **Elysia.js Docs**: https://elysiajs.com/introduction.html
- **Issues**: Open a GitHub issue

---

**Happy coding! 🎉**
