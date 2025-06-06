import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";

// Import configuration
import { config } from "./config";

// Import routes
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { taskRoutes } from "./routes/tasks";
import { healthRoutes } from "./routes/health";

const app = new Elysia()
  // Swagger documentation
  .use(
    swagger({
      documentation: {
        info: {
          title: config.apiTitle,
          version: config.apiVersion,
          description: config.apiDescription,
        },
        tags: [
          { name: "Health", description: "Health check endpoints" },
          {
            name: "Authentication",
            description: "User authentication and authorization",
          },
          { name: "Users", description: "User management operations" },
          { name: "Tasks", description: "Task management operations" },
        ],
      },
    })
  )

  // CORS middleware
  .use(
    cors({
      origin: config.corsOrigins,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  )

  // JWT middleware
  .use(
    jwt({
      name: "jwt",
      secret: config.jwtSecret,
    })
  )

  // Cookie middleware
  .use(cookie())

  // Global error handler
  .onError(({ error, code, set }) => {
    console.error("API Error:", error);

    // Extract error message safely
    const errorMessage = error instanceof Error ? error.message : String(error);

    switch (code) {
      case "VALIDATION":
        set.status = 400;
        return {
          error: "Validation Error",
          message: errorMessage,
          status: 400,
        };
      case "NOT_FOUND":
        set.status = 404;
        return {
          error: "Not Found",
          message: "The requested resource was not found",
          status: 404,
        };
      case "INTERNAL_SERVER_ERROR":
        set.status = 500;
        return {
          error: "Internal Server Error",
          message: config.isDevelopment
            ? errorMessage
            : "Something went wrong on our end",
          status: 500,
        };
      default:
        set.status = 500;
        return {
          error: "Unknown Error",
          message: config.isDevelopment ? errorMessage : "Something went wrong",
          status: 500,
        };
    }
  })

  // Welcome route
  .get(
    "/",
    () => ({
      message: `Welcome to ${config.apiTitle}`,
      version: config.apiVersion,
      environment: config.nodeEnv,
      documentation: "/swagger",
      endpoints: {
        health: "/health",
        auth: "/auth",
        users: "/users",
        tasks: "/tasks",
      },
    }),
    {
      detail: {
        summary: "Welcome endpoint",
        description: "Returns API information and available endpoints",
        tags: ["Health"],
      },
    }
  )

  // Mount route modules
  .use(healthRoutes)
  .use(authRoutes)
  .use(userRoutes)
  .use(taskRoutes);

// Only start server if this file is run directly
if (import.meta.main) {
  app.listen(config.port);
  
  console.log(
    `🚀 ${config.apiTitle} is running at http://localhost:${config.port}`
  );
  console.log(
    `📚 API Documentation available at http://localhost:${config.port}/swagger`
  );
  console.log(`🔧 Environment: ${config.nodeEnv}`);
}

export default app;
