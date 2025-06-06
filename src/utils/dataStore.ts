import type { User, Task, TaskStatus, TaskPriority } from "../types";

// In-memory data store (in production, this would be a database)
class DataStore {
  private users: User[] = [];
  private tasks: Task[] = [];

  constructor() {
    // Add a sample task
    this.tasks.push({
      id: "sample-task-1",
      title: "Welcome to Task Management",
      description: "This is a sample task to demonstrate the API functionality",
      status: "todo",
      priority: "medium",
      userId: "system",
      tags: ["welcome", "demo"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // User methods
  getAllUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  createUser(user: User): User {
    this.users.push(user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  deleteUser(id: string): boolean {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  // Task methods
  getAllTasks(): Task[] {
    return [...this.tasks];
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  getTasksByUserId(userId: string): Task[] {
    return this.tasks.filter((task) => task.userId === userId);
  }

  createTask(task: Task): Task {
    this.tasks.push(task);
    return task;
  }

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) return null;

    this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
    return this.tasks[taskIndex];
  }

  deleteTask(id: string): boolean {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) return false;

    this.tasks.splice(taskIndex, 1);
    return true;
  }

  // Statistics methods
  getUserStats() {
    const totalUsers = this.users.length;
    const recentUsers = this.users.filter((user) => {
      const userDate = new Date(user.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return userDate > weekAgo;
    }).length;

    return {
      total_users: totalUsers,
      recent_users: recentUsers,
      users_with_bio: this.users.filter((u) => u.bio).length,
      users_with_avatar: this.users.filter((u) => u.avatar).length,
    };
  }

  getTaskStats() {
    const totalTasks = this.tasks.length;
    const statusCounts = {
      todo: this.tasks.filter((task) => task.status === "todo").length,
      in_progress: this.tasks.filter((task) => task.status === "in_progress")
        .length,
      completed: this.tasks.filter((task) => task.status === "completed")
        .length,
      cancelled: this.tasks.filter((task) => task.status === "cancelled")
        .length,
    };

    const priorityCounts = {
      low: this.tasks.filter((task) => task.priority === "low").length,
      medium: this.tasks.filter((task) => task.priority === "medium").length,
      high: this.tasks.filter((task) => task.priority === "high").length,
      urgent: this.tasks.filter((task) => task.priority === "urgent").length,
    };

    const overdueTasks = this.tasks.filter((task) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task.status !== "completed";
    }).length;

    return {
      total_tasks: totalTasks,
      status_counts: statusCounts,
      priority_counts: priorityCounts,
      overdue_tasks: overdueTasks,
      completion_rate:
        totalTasks > 0
          ? Math.round((statusCounts.completed / totalTasks) * 100)
          : 0,
    };
  }
}

// Export singleton instance
export const dataStore = new DataStore();
