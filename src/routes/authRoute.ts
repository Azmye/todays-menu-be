import { LoginDtoSchema, RegisterDtoSchema } from "@dto/authDto";
import {
  login,
  refreshToken,
  register,
  revokeRefreshToken,
} from "@handlers/authHandler";
import { Hono } from "hono";

const authRoute = new Hono()
  .post("/register", async (c) => {
    const request = await c.req.json();

    const parsedReq = RegisterDtoSchema.parse(request);

    const result = await register(parsedReq);

    c.status(201);
    return c.json({
      data: result,
    });
  })
  .post("/login", async (c) => {
    const request = await c.req.json();

    const parsedReq = LoginDtoSchema.parse(request);

    const result = await login(parsedReq);

    c.status(200);
    return c.json({
      data: result,
    });
  })
  .post("/refresh", async (c) => {
    const result = await refreshToken({
      refreshToken: c.req.header("x-refresh-token")!,
    });

    return c.json(result);
  })
  .post("/logout", async (c) => {
    await revokeRefreshToken(c.req.header("x-refresh-token")!);

    return c.json({ message: "Logged out successfully" });
  });

export default authRoute;
