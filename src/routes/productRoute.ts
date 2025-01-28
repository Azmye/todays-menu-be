import { newProductDtoSchema, updateProductDtoSchema } from "@dto/productDto";
import { UserContext } from "@dto/userDto";
import {
  changeProductImage,
  deleteProduct,
  getProduct,
  getProducts,
  newProduct,
  updateProduct,
} from "@handlers/productHandler";
import { sellerOnly } from "@middleware/authMiddleware";
import { Hono } from "hono";
import { API_MESSAGES } from "src/constants/application";

const productRoute = new Hono<UserContext>()
  .get("/:storeName", async (c) => {
    const storeName = c.req.param("storeName");

    const result = await getProducts(storeName);

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_RETRIEVED,
      data: result,
    });
  })
  .get("/:uuid", async (c) => {
    const uuid = c.req.param("uuid");

    const result = await getProduct(uuid);

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_RETRIEVED,
      data: result,
    });
  })
  .post("/", sellerOnly, async (c) => {
    const { uuid } = c.get("user");
    const request = await c.req.json();
    const parsedReq = newProductDtoSchema.parse(request);

    const result = await newProduct(uuid, parsedReq);

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_CREATED,
      data: result,
    });
  })
  .put("/:uuid", sellerOnly, async (c) => {
    const uuid = c.req.param("uuid");
    const request = await c.req.json();
    const parsedReq = updateProductDtoSchema.parse(request);

    const result = await updateProduct(uuid, parsedReq);

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_UPDATED,
      data: result,
    });
  })
  .patch("/change_product_image/:uuid", sellerOnly, async (c) => {
    const uuid = c.req.param("uuid");
    const body = await c.req.parseBody();
    const imageRequest = body["previewImage"] as File;

    const result = await changeProductImage(uuid, imageRequest);

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_UPDATED,
      data: result,
    });
  })
  .delete("/:uuid", sellerOnly, async (c) => {
    const uuid = c.req.param("uuid");

    await deleteProduct(uuid);

    c.status(200);
    return c.json({
      message: API_MESSAGES.SUCCESS_DELETED,
    });
  });

export default productRoute;
