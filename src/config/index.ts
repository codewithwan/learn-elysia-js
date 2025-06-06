import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || "localhost",
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  
  // Environment
  nodeEnv: process.env.NODE_ENV || "development",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  
  // API configuration
  apiVersion: "1.0.0",
  apiTitle: "Elysia.js Example API",
  apiDescription: "A comprehensive example backend API built with Elysia.js featuring authentication, CRUD operations, and more.",
  
  // Pagination defaults
  defaultPageSize: 10,
  maxPageSize: 100,
  
  // CORS configuration
  corsOrigins: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:3001"],
  
  // Rate limiting (for future implementation)
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // limit each IP to 100 requests per windowMs
};

// Validate required environment variables in production
if (config.isProduction) {
  const requiredEnvVars = ["JWT_SECRET"];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }
  
  // Warn about default values in production
  if (config.jwtSecret === "your-secret-key-change-this-in-production") {
    console.warn("⚠️  Warning: Using default JWT secret in production!");
  }
} 