import authRoute from "@routes/authRoute";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { logger } from "hono/logger";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.use(logger());

app.route("api/auth", authRoute);

app.notFound((c) => {
  return c.json({
    message: "url not found",
  });
});

app.onError(async (err, c) => {
  if (err instanceof HTTPException) {
    c.status(err.status);
    return c.json({
      errors: err.message,
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
      errors: err.message,
    });
  }
});

export default {
  port: process.env.PORT,
  fetch: app.fetch,
};
