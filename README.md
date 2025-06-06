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

## 📋 Prerequisites

Before running this project, make sure you have:

- **Bun**: [Install Bun](https://bun.sh/docs/installation) (v1.0.0 or higher)
- **Node.js**: v18.0.0 or higher (optional, for compatibility)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd elysia-backend-example
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start the development server:**
   ```bash
   bun run dev
   ```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: `http://localhost:3000/swagger`

## 🔗 API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /health/ping` - Simple ping endpoint
- `GET /health/status` - Service status information

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user info
- `POST /auth/refresh` - Refresh JWT token

### Users
- `GET /users` - Get all users (paginated)
- `GET /users/:id` - Get user by ID
- `PUT /users/profile` - Update user profile (authenticated)
- `DELETE /users/account` - Delete user account (authenticated)
- `GET /users/stats` - Get user statistics

### Tasks
- `GET /tasks` - Get all tasks (with filtering and pagination)
- `GET /tasks/:id` - Get task by ID
- `POST /tasks` - Create new task (authenticated)
- `PUT /tasks/:id` - Update task (authenticated)
- `DELETE /tasks/:id` - Delete task (authenticated)
- `GET /tasks/my/tasks` - Get current user's tasks (authenticated)
- `GET /tasks/stats` - Get task statistics

## 🔧 Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create a task (requires authentication)
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "priority": "high",
    "tags": ["documentation", "priority"]
  }'
```

### Get tasks with filtering
```bash
curl "http://localhost:3000/tasks?status=todo&priority=high&page=1&limit=10"
```

## 🏗️ Project Structure

```
src/
├── index.ts           # Main application entry point
├── routes/            # Route modules
│   ├── auth.ts        # Authentication routes
│   ├── users.ts       # User management routes
│   ├── tasks.ts       # Task management routes
│   └── health.ts      # Health check routes
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🛡️ Security Features

- **Password Hashing**: Uses bcrypt for secure password storage
- **JWT Authentication**: Stateless authentication with configurable expiration
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses without sensitive data exposure

## 🔄 Data Management

Currently, this example uses in-memory storage for simplicity. In a production environment, you would typically integrate with:

- **Database**: PostgreSQL, MySQL, MongoDB, etc.
- **ORM/Query Builder**: Prisma, DrizzleORM, TypeORM, etc.
- **Caching**: Redis, Memcached
- **File Storage**: AWS S3, Google Cloud Storage

## 📊 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "status": 400
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🧪 Testing

You can test the API using various tools:

### Using curl
```bash
# Health check
curl http://localhost:3000/health

# Get API information
curl http://localhost:3000/
```

### Using Postman
1. Import the OpenAPI/Swagger specification from `http://localhost:3000/swagger`
2. Create requests based on the documented endpoints

### Using HTTPie
```bash
# Install HTTPie
pip install httpie

# Test endpoints
http GET localhost:3000/health
http POST localhost:3000/auth/register email=test@example.com password=password123 name="Test User"
```

## 🚀 Deployment

### Production Setup

1. **Environment Variables:**
   ```env
   PORT=3000
   JWT_SECRET=your-production-jwt-secret-minimum-256-bits
   NODE_ENV=production
   ```

2. **Build and Run:**
   ```bash
   bun run build  # If you have a build script
   bun run start  # Production start command
   ```

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "src/index.ts"]
```

Build and run:
```bash
docker build -t elysia-api .
docker run -p 3000:3000 elysia-api
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Elysia.js](https://elysiajs.com/) - The fast and friendly web framework
- [Bun](https://bun.sh/) - The fast JavaScript runtime
- [Swagger/OpenAPI](https://swagger.io/) - API documentation standard

## 📞 Support

If you have any questions or need help with this project:

1. Check the [API Documentation](http://localhost:3000/swagger)
2. Review the [Elysia.js Documentation](https://elysiajs.com/introduction.html)
3. Open an issue on GitHub

---

**Happy coding! 🎉**