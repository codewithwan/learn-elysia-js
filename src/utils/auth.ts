import type { JWTPayload } from "../types";

/**
 * Authenticate user from JWT token in headers
 */
export const authenticateUser = async (
  jwt: any,
  headers: any,
  set: any
): Promise<JWTPayload> => {
  const authorization = headers.authorization;

  if (!authorization) {
    set.status = 401;
    throw new Error("No authorization header provided");
  }

  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : authorization;

  try {
    const payload = (await jwt.verify(token)) as JWTPayload;
    return payload;
  } catch (error) {
    set.status = 401;
    throw new Error("Invalid or expired token");
  }
};

/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Create JWT payload
 */
export const createJWTPayload = (
  userId: string,
  email: string
): Omit<JWTPayload, "exp"> & { exp: number } => {
  return {
    userId,
    email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  };
};
