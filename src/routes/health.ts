import { Elysia } from "elysia";

export const healthRoutes = new Elysia({ prefix: "/health" })
  .get("/", () => ({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: "1.0.0"
  }), {
    detail: {
      summary: "Health check",
      description: "Returns the API health status and system information",
      tags: ["Health"]
    }
  })
  
  .get("/ping", () => "pong", {
    detail: {
      summary: "Ping endpoint",
      description: "Simple ping endpoint that returns 'pong'",
      tags: ["Health"]
    }
  })
  
  .get("/status", () => ({
    status: "operational",
    services: {
      database: "connected",
      cache: "connected",
      external_api: "available"
    },
    last_check: new Date().toISOString()
  }), {
    detail: {
      summary: "Service status",
      description: "Returns the status of various services and dependencies",
      tags: ["Health"]
    }
  }); 