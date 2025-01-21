import { UserUpdateDtoSchema } from "@dto/userDto";
import {
  getAllUsers,
  getUser,
  userDelete,
  userUpdate,
} from "@handlers/userHandler";
import { adminOnly, authRequired } from "@middleware/authMiddleware";
import { Hono } from "hono";

const userRoute = new Hono()
  .get("/", authRequired, async (c) => {
    const result = await getAllUsers();

    return c.json({
      data: result,
    });
  })
  .get("/:uuid", authRequired, async (c) => {
    const uuid = c.req.param("uuid");
    const result = await getUser(uuid);

    c.status(200);
    return c.json({
      data: result,
    });
  })
  .put("/:uuid", authRequired, async (c) => {
    const uuid = c.req.param("uuid");
    const request = await c.req.json();
    const parsedReq = UserUpdateDtoSchema.parse(request);

    const result = await userUpdate(parsedReq, uuid);

    c.status(200);
    return c.json({
      message: "User updated successfully",
      data: result,
    });
  })
  .delete("/:uuid", adminOnly, async (c) => {
    const uuid = c.req.param("uuid");

    const result = await userDelete(uuid);

    c.status(200);
    return c.json({
      message: "User deleted successfully",
      data: result,
    });
  });

export default userRoute;
