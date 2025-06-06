import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";

// In a real application, this would be a database
const users: Array<{
  id: string;
  email: string;
  password: string;
  name: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}> = [];

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
    const payload = (await jwt.verify(token)) as {
      userId: string;
      email: string;
    };

    return payload;
  } catch (error) {
    set.status = 401;
    throw new Error("Invalid or expired token");
  }
};

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(
    jwt({
      name: "jwt",
      secret:
        process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
    })
  )

  // Get all users (public endpoint with pagination)
  .get(
    "/",
    ({ query }) => {
      const page = parseInt(query.page as string) || 1;
      const limit = parseInt(query.limit as string) || 10;
      const search = (query.search as string) || "";

      let filteredUsers = users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
      }));

      // Apply search filter
      if (search) {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      return {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / limit),
          hasNext: endIndex < filteredUsers.length,
          hasPrev: page > 1,
        },
      };
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
      detail: {
        summary: "Get all users",
        description: "Retrieve a paginated list of users with optional search",
        tags: ["Users"],
      },
    }
  )

  // Get user by ID
  .get(
    "/:id",
    ({ params, set }) => {
      const user = users.find((u) => u.id === params.id);
      if (!user) {
        set.status = 404;
        return {
          error: "User not found",
          message: "No user found with the provided ID",
        };
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          bio: user.bio,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "Get user by ID",
        description: "Retrieve a specific user by their ID",
        tags: ["Users"],
      },
    }
  )

  // Update current user profile
  .put(
    "/profile",
    async ({ body, jwt, headers, set }) => {
      try {
        const payload = await authenticateUser(jwt, headers, set);
        const { name, bio, avatar } = body as {
          name?: string;
          bio?: string;
          avatar?: string;
        };

        const userIndex = users.findIndex((u) => u.id === payload.userId);
        if (userIndex === -1) {
          set.status = 404;
          return {
            error: "User not found",
            message: "User associated with token not found",
          };
        }

        // Update user fields
        if (name !== undefined) users[userIndex].name = name;
        if (bio !== undefined) users[userIndex].bio = bio;
        if (avatar !== undefined) users[userIndex].avatar = avatar;
        users[userIndex].updatedAt = new Date().toISOString();

        return {
          message: "Profile updated successfully",
          user: {
            id: users[userIndex].id,
            email: users[userIndex].email,
            name: users[userIndex].name,
            bio: users[userIndex].bio,
            avatar: users[userIndex].avatar,
            createdAt: users[userIndex].createdAt,
            updatedAt: users[userIndex].updatedAt,
          },
        };
      } catch (error) {
        return {
          error: "Authentication failed",
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String({ minLength: 2 })),
        bio: t.Optional(t.String({ maxLength: 500 })),
        avatar: t.Optional(t.String({ format: "uri" })),
      }),
      detail: {
        summary: "Update user profile",
        description: "Update the authenticated user's profile information",
        tags: ["Users"],
      },
    }
  )

  // Delete current user account
  .delete(
    "/account",
    async ({ jwt, headers, set }) => {
      try {
        const payload = await authenticateUser(jwt, headers, set);

        const userIndex = users.findIndex((u) => u.id === payload.userId);
        if (userIndex === -1) {
          set.status = 404;
          return {
            error: "User not found",
            message: "User associated with token not found",
          };
        }

        users.splice(userIndex, 1);

        return {
          message: "Account deleted successfully",
        };
      } catch (error) {
        return {
          error: "Authentication failed",
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      detail: {
        summary: "Delete user account",
        description: "Delete the authenticated user's account permanently",
        tags: ["Users"],
      },
    }
  )

  // Get user statistics
  .get(
    "/stats",
    () => {
      const totalUsers = users.length;
      const recentUsers = users.filter((user) => {
        const userDate = new Date(user.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return userDate > weekAgo;
      }).length;

      return {
        total_users: totalUsers,
        recent_users: recentUsers,
        users_with_bio: users.filter((u) => u.bio).length,
        users_with_avatar: users.filter((u) => u.avatar).length,
      };
    },
    {
      detail: {
        summary: "Get user statistics",
        description: "Get statistics about users in the system",
        tags: ["Users"],
      },
    }
  );
