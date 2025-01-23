import {
  StoreDtoSchema,
  StoreUpdateDtoSchema,
  StoreVerifyDtoSchema,
} from "@dto/storeDto";
import { UserContext } from "@dto/userDto";
import {
  deleteStore,
  getStore,
  getStores,
  newStore,
  updateStore,
  verifyStore,
} from "@handlers/storeHandler";
import {
  adminOnly,
  authRequired,
  sellerOnly,
} from "@middleware/authMiddleware";
import { Hono } from "hono";
import { API_MESSAGES } from "src/constants/application";

const storeRoute = new Hono<UserContext>()
  .get("/", async (c) => {
    const result = await getStores();

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_RETRIEVED,
      data: result,
    });
  })
  .get("/:storeUrlName", async (c) => {
    const storeUrlName = c.req.param("storeUrlName");

    const result = await getStore({ storeUrlName });

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_RETRIEVED,
      data: result,
    });
  })
  .post("/", authRequired, async (c) => {
    const request = await c.req.json();

    const user = c.get("user");

    const parsedReq = StoreDtoSchema.parse(request);

    const result = await newStore(user, parsedReq);

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_CREATED,
      data: result,
    });
  })
  .put("/:uuid", sellerOnly, async (c) => {
    const uuid = c.req.param("uuid");
    const request = await c.req.json();

    const parsedReq = StoreUpdateDtoSchema.parse(request);

    const result = await updateStore({ uuid, request: parsedReq });

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_UPDATED,
      data: result,
    });
  })
  .delete("/:uuid", adminOnly, async (c) => {
    const uuid = c.req.param("uuid");

    await deleteStore(uuid);

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_DELETED,
    });
  })
  .put("/store-verify/:uuid", adminOnly, async (c) => {
    const uuid = c.req.param("uuid");
    const request = await c.req.json();

    const { verify } = StoreVerifyDtoSchema.parse(request);

    const result = await verifyStore({ uuid, verify });

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_UPDATED,
      data: result,
    });
  });

export default storeRoute;
