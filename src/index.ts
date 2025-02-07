import authRoute from "@routes/authRoute";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { logger } from "hono/logger";
import userRoute from "@routes/userRoute";
import userRoleRoute from "@routes/userRoleRoute";
import roleRoute from "@routes/roleRoute";
import storeRoute from "@routes/storeRoute";
import productRoute from "@routes/productRoute";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*", // Apply to all routes
  cors({
    origin: "*", // Allow all origins (replace with specific origins in production)
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowHeaders: ["Content-Type", "Authorization", "x-refresh-token"], // Allowed headers
    exposeHeaders: ["Content-Length", "X-Custom-Header"], // Headers exposed to the client
    maxAge: 86400, // How long the results of a preflight request can be cached (in seconds)
    credentials: true, // Allow credentials (e.g., cookies, authorization headers)
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.use(logger());

app.route("api/auth", authRoute);
app.route("api/user", userRoute);
app.route("api/user_role", userRoleRoute);
app.route("api/role", roleRoute);
app.route("api/store", storeRoute);
app.route("api/product", productRoute);

app.notFound((c) => {
  return c.json({
    message: "url not found",
  });
});

app.onError(async (err, c) => {
  if (err instanceof HTTPException) {
    c.status(err.status);
    return c.json({
      message: err.message,
    });
  } else if (err instanceof ZodError) {
    c.status(400);
    return c.json({
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
        code: e.code,
      })),
    });
  } else {
    c.status(500);
    return c.json({
      message: err.message,
    });
  }
});

export default {
  port: process.env.PORT,
  fetch: app.fetch,
};
