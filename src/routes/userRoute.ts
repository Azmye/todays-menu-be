import { UserContext, UserUpdateDtoSchema } from "@dto/userDto";
import {
  getAllUsers,
  getUser,
  userChangeProfileImage,
  userDelete,
  userUpdate,
} from "@handlers/userHandler";
import { adminOnly, authRequired } from "@middleware/authMiddleware";
import { Hono } from "hono";
import { API_MESSAGES } from "src/constants/application";

const userRoute = new Hono<UserContext>()
  .get("/", authRequired, async (c) => {
    const result = await getAllUsers();

    return c.json({
      message: API_MESSAGES.SUCCESS_RETRIEVED,
      data: result,
    });
  })
  .get("/:uuid", authRequired, async (c) => {
    const uuid = c.req.param("uuid");
    const result = await getUser(uuid);

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_RETRIEVED,
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
      message: API_MESSAGES.SUCCESS_UPDATED,
      data: result,
    });
  })
  .patch("/change_profile_image", authRequired, async (c) => {
    const body = await c.req.parseBody();
    const imageRequest = body["profilePhotoUrl"] as File;
    const user = c.get("user");

    const result = await userChangeProfileImage(user, imageRequest);

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_UPDATED,
      data: result,
    });
  })
  .delete("/:uuid", adminOnly, async (c) => {
    const uuid = c.req.param("uuid");

    const result = await userDelete(uuid);

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_DELETED,
      data: result,
    });
  });

export default userRoute;
