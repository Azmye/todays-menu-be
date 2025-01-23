import { roleDtoSchema } from "@dto/roleDto";
import {
  getRole,
  getRoles,
  roleDelete,
  roleInsert,
  roleUpdate,
} from "@handlers/roleHandler";
import { adminOnly } from "@middleware/authMiddleware";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { API_MESSAGES } from "src/constants/application";

const roleRoute = new Hono()
  .get("/", adminOnly, async (c) => {
    const result = await getRoles();

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_RETRIEVED,
      data: result,
    });
  })
  .get("/:uuid", adminOnly, async (c) => {
    const uuid = c.req.param("uuid");

    const result = await getRole({ uuid: uuid });

    if (!result.role) {
      throw new HTTPException(404, { message: API_MESSAGES.FAILED_NOT_FOUND });
    }

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_RETRIEVED,
      data: result,
    });
  })
  .post("/", adminOnly, async (c) => {
    const request = await c.req.json();

    const parsedReq = roleDtoSchema.parse(request);

    const result = await roleInsert(parsedReq);

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_CREATED,
      data: {
        result,
      },
    });
  })
  .patch("/:uuid", adminOnly, async (c) => {
    const uuid = c.req.param("uuid");
    const request = await c.req.json();

    const parsedReq = roleDtoSchema.parse({
      ...request,
      uuid: uuid,
    });

    const result = await roleUpdate(parsedReq);

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_UPDATED,
      data: {
        result,
      },
    });
  })
  .delete("/:uuid", adminOnly, async (c) => {
    const uuid = c.req.param("uuid");

    await roleDelete(uuid);

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_DELETED,
    });
  });

export default roleRoute;
