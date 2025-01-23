import { UserRoleDtoSchema } from "@dto/userRoleDto";
import { userRoleUpdate } from "@handlers/userRoleHandler";
import { authRequired } from "@middleware/authMiddleware";
import { Hono } from "hono";

const userRoleRoute = new Hono().patch("/:uuid", authRequired, async (c) => {
  const uuid = c.req.param("uuid");
  const request = await c.req.json();

  const result = await userRoleUpdate({
    ...request,
    userUuid: uuid,
  });

  c.json(200);
  return c.json({
    message: "User role successfully updated",
    data: result,
  });
});

export default userRoleRoute;
