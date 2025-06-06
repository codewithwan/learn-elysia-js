import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import bcrypt from "bcryptjs";

// In a real application, this would be a database
const users: Array<{
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}> = [];

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret:
        process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
    })
  )
  .use(cookie())

  // Register endpoint
  .post(
    "/register",
    async ({ body, jwt, set }) => {
      const { email, password, name } = body as {
        email: string;
        password: string;
        name: string;
      };

      // Check if user already exists
      const existingUser = users.find((user) => user.email === email);
      if (existingUser) {
        set.status = 400;
        return {
          error: "User already exists",
          message: "A user with this email already exists",
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        password: hashedPassword,
        name,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);

      // Generate JWT token
      const token = await jwt.sign({
        userId: newUser.id,
        email: newUser.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
      });

      return {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          createdAt: newUser.createdAt,
        },
        token,
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
        name: t.String({ minLength: 2 }),
      }),
      detail: {
        summary: "Register a new user",
        description: "Create a new user account with email and password",
        tags: ["Authentication"],
      },
    }
  )

  // Login endpoint
  .post(
    "/login",
    async ({ body, jwt, cookie, set }) => {
      const { email, password } = body as {
        email: string;
        password: string;
      };

      // Find user
      const user = users.find((u) => u.email === email);
      if (!user) {
        set.status = 401;
        return {
          error: "Invalid credentials",
          message: "Email or password is incorrect",
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        set.status = 401;
        return {
          error: "Invalid credentials",
          message: "Email or password is incorrect",
        };
      }

      // Generate JWT token
      const token = await jwt.sign({
        userId: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
      });

      // Set HTTP-only cookie
      cookie.auth.set({
        value: token,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 1000, // 24 hours
        sameSite: "strict",
      });

      return {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        token,
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
      detail: {
        summary: "Login user",
        description: "Authenticate user with email and password",
        tags: ["Authentication"],
      },
    }
  )

  // Logout endpoint
  .post(
    "/logout",
    ({ cookie }) => {
      cookie.auth.remove();
      return {
        message: "Logged out successfully",
      };
    },
    {
      detail: {
        summary: "Logout user",
        description: "Clear authentication cookies and logout user",
        tags: ["Authentication"],
      },
    }
  )

  // Get current user endpoint
  .get(
    "/me",
    async ({ jwt, headers, set }) => {
      const authorization = headers.authorization;
      if (!authorization) {
        set.status = 401;
        return {
          error: "Unauthorized",
          message: "No authorization header provided",
        };
      }

      const token = authorization.startsWith("Bearer ")
        ? authorization.slice(7)
        : authorization;

      try {
        const payload = (await jwt.verify(token)) as {
          userId: string;
          email: string;
        };

        const user = users.find((u) => u.id === payload.userId);
        if (!user) {
          set.status = 404;
          return {
            error: "User not found",
            message: "User associated with token not found",
          };
        }

        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
          },
        };
      } catch (error) {
        set.status = 401;
        return {
          error: "Invalid token",
          message: "The provided token is invalid or expired",
        };
      }
    },
    {
      detail: {
        summary: "Get current user",
        description: "Get the currently authenticated user's information",
        tags: ["Authentication"],
      },
    }
  )

  // Refresh token endpoint
  .post(
    "/refresh",
    async ({ jwt, headers, set }) => {
      const authorization = headers.authorization;
      if (!authorization) {
        set.status = 401;
        return {
          error: "Unauthorized",
          message: "No authorization header provided",
        };
      }

      const token = authorization.startsWith("Bearer ")
        ? authorization.slice(7)
        : authorization;

      try {
        const payload = (await jwt.verify(token)) as {
          userId: string;
          email: string;
        };

        // Generate new token
        const newToken = await jwt.sign({
          userId: payload.userId,
          email: payload.email,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
        });

        return {
          message: "Token refreshed successfully",
          token: newToken,
        };
      } catch (error) {
        set.status = 401;
        return {
          error: "Invalid token",
          message: "Cannot refresh invalid or expired token",
        };
      }
    },
    {
      detail: {
        summary: "Refresh authentication token",
        description: "Generate a new JWT token using the current valid token",
        tags: ["Authentication"],
      },
    }
  );
