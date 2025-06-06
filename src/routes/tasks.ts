import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";

// Task status and priority enums
const TaskStatus = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
} as const;

const TaskPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent"
} as const;

// In a real application, this would be a database
const tasks: Array<{
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  userId: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: "sample-task-1",
    title: "Welcome to Task Management",
    description: "This is a sample task to demonstrate the API functionality",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    userId: "system",
    tags: ["welcome", "demo"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Authentication middleware
const authenticateUser = async (jwt: any, headers: any, set: any) => {
  const authorization = headers.authorization;
  if (!authorization) {
    set.status = 401;
    throw new Error("No authorization header provided");
  }

  const token = authorization.startsWith("Bearer ") 
    ? authorization.slice(7) 
    : authorization;

  try {
    const payload = await jwt.verify(token) as {
      userId: string;
      email: string;
    };

    return payload;
  } catch (error) {
    set.status = 401;
    throw new Error("Invalid or expired token");
  }
};

export const taskRoutes = new Elysia({ prefix: "/tasks" })
  .use(jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
  }))
  
  // Get all tasks with filtering and pagination
  .get("/", ({ query }) => {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const status = query.status as string;
    const priority = query.priority as string;
    const search = query.search as string || "";
    const tag = query.tag as string;

    let filteredTasks = [...tasks];

    // Apply filters
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    if (search) {
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (tag) {
      filteredTasks = filteredTasks.filter(task => task.tags.includes(tag));
    }

    // Sort by creation date (newest first)
    filteredTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    return {
      tasks: paginatedTasks,
      pagination: {
        page,
        limit,
        total: filteredTasks.length,
        totalPages: Math.ceil(filteredTasks.length / limit),
        hasNext: endIndex < filteredTasks.length,
        hasPrev: page > 1
      },
      filters: {
        available_statuses: Object.values(TaskStatus),
        available_priorities: Object.values(TaskPriority)
      }
    };
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      status: t.Optional(t.String()),
      priority: t.Optional(t.String()),
      search: t.Optional(t.String()),
      tag: t.Optional(t.String())
    }),
    detail: {
      summary: "Get all tasks",
      description: "Retrieve a paginated and filtered list of tasks",
      tags: ["Tasks"]
    }
  })
  
  // Get task by ID
  .get("/:id", ({ params, set }) => {
    const task = tasks.find(t => t.id === params.id);
    if (!task) {
      set.status = 404;
      return {
        error: "Task not found",
        message: "No task found with the provided ID"
      };
    }

    return { task };
  }, {
    params: t.Object({
      id: t.String()
    }),
    detail: {
      summary: "Get task by ID",
      description: "Retrieve a specific task by its ID",
      tags: ["Tasks"]
    }
  })
  
  // Create new task (requires authentication)
  .post("/", async ({ body, jwt, headers, set }) => {
    try {
      const payload = await authenticateUser(jwt, headers, set);
      const { title, description, priority, dueDate, tags } = body as {
        title: string;
        description?: string;
        priority: string;
        dueDate?: string;
        tags?: string[];
      };

      const newTask = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        description,
        status: TaskStatus.TODO,
        priority,
        userId: payload.userId,
        dueDate,
        tags: tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      tasks.push(newTask);

      return {
        message: "Task created successfully",
        task: newTask
      };
    } catch (error) {
      return {
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }, {
    body: t.Object({
      title: t.String({ minLength: 1, maxLength: 200 }),
      description: t.Optional(t.String({ maxLength: 1000 })),
      priority: t.Union([
        t.Literal("low"),
        t.Literal("medium"),
        t.Literal("high"),
        t.Literal("urgent")
      ]),
      dueDate: t.Optional(t.String({ format: "date" })),
      tags: t.Optional(t.Array(t.String()))
    }),
    detail: {
      summary: "Create new task",
      description: "Create a new task for the authenticated user",
      tags: ["Tasks"]
    }
  })
  
  // Update task
  .put("/:id", async ({ params, body, jwt, headers, set }) => {
    try {
      const payload = await authenticateUser(jwt, headers, set);
      const { title, description, status, priority, dueDate, tags } = body as {
        title?: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string;
        tags?: string[];
      };

      const taskIndex = tasks.findIndex(t => t.id === params.id);
      if (taskIndex === -1) {
        set.status = 404;
        return {
          error: "Task not found",
          message: "No task found with the provided ID"
        };
      }

      // Check if user owns the task (or is admin)
      if (tasks[taskIndex].userId !== payload.userId && tasks[taskIndex].userId !== "system") {
        set.status = 403;
        return {
          error: "Access denied",
          message: "You can only update your own tasks"
        };
      }

      // Update task fields
      if (title !== undefined) tasks[taskIndex].title = title;
      if (description !== undefined) tasks[taskIndex].description = description;
      if (status !== undefined) tasks[taskIndex].status = status;
      if (priority !== undefined) tasks[taskIndex].priority = priority;
      if (dueDate !== undefined) tasks[taskIndex].dueDate = dueDate;
      if (tags !== undefined) tasks[taskIndex].tags = tags;
      tasks[taskIndex].updatedAt = new Date().toISOString();

      return {
        message: "Task updated successfully",
        task: tasks[taskIndex]
      };
    } catch (error) {
      return {
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
      description: t.Optional(t.String({ maxLength: 1000 })),
      status: t.Optional(t.Union([
        t.Literal("todo"),
        t.Literal("in_progress"),
        t.Literal("completed"),
        t.Literal("cancelled")
      ])),
      priority: t.Optional(t.Union([
        t.Literal("low"),
        t.Literal("medium"),
        t.Literal("high"),
        t.Literal("urgent")
      ])),
      dueDate: t.Optional(t.String({ format: "date" })),
      tags: t.Optional(t.Array(t.String()))
    }),
    detail: {
      summary: "Update task",
      description: "Update an existing task (user can only update their own tasks)",
      tags: ["Tasks"]
    }
  })
  
  // Delete task
  .delete("/:id", async ({ params, jwt, headers, set }) => {
    try {
      const payload = await authenticateUser(jwt, headers, set);

      const taskIndex = tasks.findIndex(t => t.id === params.id);
      if (taskIndex === -1) {
        set.status = 404;
        return {
          error: "Task not found",
          message: "No task found with the provided ID"
        };
      }

      // Check if user owns the task (or is admin)
      if (tasks[taskIndex].userId !== payload.userId && tasks[taskIndex].userId !== "system") {
        set.status = 403;
        return {
          error: "Access denied",
          message: "You can only delete your own tasks"
        };
      }

      tasks.splice(taskIndex, 1);

      return {
        message: "Task deleted successfully"
      };
    } catch (error) {
      return {
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    detail: {
      summary: "Delete task",
      description: "Delete an existing task (user can only delete their own tasks)",
      tags: ["Tasks"]
    }
  })
  
  // Get user's tasks
  .get("/my/tasks", async ({ jwt, headers, query, set }) => {
    try {
      const payload = await authenticateUser(jwt, headers, set);
      const page = parseInt(query.page as string) || 1;
      const limit = parseInt(query.limit as string) || 10;
      const status = query.status as string;

      let userTasks = tasks.filter(task => task.userId === payload.userId);

      if (status) {
        userTasks = userTasks.filter(task => task.status === status);
      }

      userTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTasks = userTasks.slice(startIndex, endIndex);

      return {
        tasks: paginatedTasks,
        pagination: {
          page,
          limit,
          total: userTasks.length,
          totalPages: Math.ceil(userTasks.length / limit),
          hasNext: endIndex < userTasks.length,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      return {
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      status: t.Optional(t.String())
    }),
    detail: {
      summary: "Get user's tasks",
      description: "Get all tasks belonging to the authenticated user",
      tags: ["Tasks"]
    }
  })
  
  // Get task statistics
  .get("/stats", () => {
    const totalTasks = tasks.length;
    const statusCounts = Object.values(TaskStatus).reduce((acc, status) => {
      acc[status] = tasks.filter(task => task.status === status).length;
      return acc;
    }, {} as Record<string, number>);

    const priorityCounts = Object.values(TaskPriority).reduce((acc, priority) => {
      acc[priority] = tasks.filter(task => task.priority === priority).length;
      return acc;
    }, {} as Record<string, number>);

    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED;
    }).length;

    return {
      total_tasks: totalTasks,
      status_counts: statusCounts,
      priority_counts: priorityCounts,
      overdue_tasks: overdueTasks,
      completion_rate: totalTasks > 0 ? Math.round((statusCounts.completed / totalTasks) * 100) : 0
    };
  }, {
    detail: {
      summary: "Get task statistics",
      description: "Get comprehensive statistics about tasks in the system",
      tags: ["Tasks"]
    }
  }); 