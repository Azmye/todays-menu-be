import db from "@db/index";
import { users } from "@db/schema";
import { verifyToken } from "@utils/jwt";
import { eq } from "drizzle-orm";
import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

interface JWTPayload {
  email: string;
  role: string[];
  exp: number;
  nbf: number;
  iat: number;
}

export const createAuthMiddleware = (requiredRole?: string[]) => {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header("Authorization");

      if (!authHeader || !authHeader?.startsWith("Bearer")) {
        throw new HTTPException(401, { message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];

      const payload = (await verifyToken(token)) as unknown as JWTPayload;

      const user = await db.query.users.findFirst({
        where: eq(users.email, payload.email),
        with: {
          userRoles: {
            with: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new HTTPException(401, { message: "User no longer exists" });
      }

      if (requiredRole && requiredRole.length > 0) {
        const userRoles = user.userRoles.map((ur) => ur.role.name);
        const hasRequiredRole = requiredRole.some((role) =>
          userRoles.includes(role)
        );

        if (!hasRequiredRole) {
          throw new HTTPException(403, {
            message: "You don't have permission to access this resource",
          });
        }

        c.set("user", user);
        c.set(
          "userRole",
          user.userRoles.map((ur) => ur.role.name)
        );
      }

      await next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new HTTPException(401, {
          message: "Token expired",
        });
      }

      if (error.name === "JsonWebTokenError") {
        throw new HTTPException(401, { message: "Invalid token" });
      }
      throw error;
    }
  };
};

export const adminOnly = createAuthMiddleware(["admin"]);
export const customerOnly = createAuthMiddleware(["customer"]);
export const authRequired = createAuthMiddleware();
