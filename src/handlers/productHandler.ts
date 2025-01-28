import db from "@db/index";
import { products } from "@db/schema";
import { NewProductDto, UpdateProductDto } from "@dto/productDto";
import { eq } from "drizzle-orm";
import { getStore } from "./storeHandler";
import { HTTPException } from "hono/http-exception";
import { API_MESSAGES } from "src/constants/application";
import { deleteAsset, uploadImage } from "@utils/cloudinary";
import { getUser } from "./userHandler";

export const getProducts = async (storeUrlName: string) => {
  const { store } = await getStore({ storeUrlName });

  if (!store) {
    throw new HTTPException(404, { message: API_MESSAGES.FAILED_NOT_FOUND });
  }

  const result = await db.query.products.findMany({
    where: eq(products.storeId, store.id),
  });

  return {
    result,
  };
};

export const getProduct = async (uuid: string) => {
  const result = await db.query.products.findFirst({
    where: eq(products.uuid, uuid),
  });

  return {
    result,
  };
};

export const newProduct = async (uuid: string, request: NewProductDto) => {
  const { user } = await getUser(uuid);

  if (!user.store) {
    throw new HTTPException(404, { message: API_MESSAGES.FAILED_NOT_FOUND });
  }

  const [result] = await db
    .insert(products)
    .values({
      name: request.name,
      storeId: user.store.id,
      price: request.price,
      isActive: true,
    })
    .returning();

  return {
    result,
  };
};

export const updateProduct = async (
  uuid: string,
  request: UpdateProductDto
) => {
  const { result: product } = await getProduct(uuid);

  if (!product) {
    throw new HTTPException(404, {
      message: API_MESSAGES.FAILED_NOT_FOUND,
    });
  }

  const [result] = await db
    .update(products)
    .set({
      name: request.name,
      price: request.price,
      isActive: request.isActive,
      discount: request.discount,
      updatedAt: new Date(),
    })
    .where(eq(products.uuid, uuid))
    .returning();

  return {
    result,
  };
};

export const changeProductImage = async (uuid: string, file: File) => {
  const { result: product } = await getProduct(uuid);

  if (!product) {
    throw new HTTPException(404, {
      message: API_MESSAGES.FAILED_NOT_FOUND,
    });
  }

  const oldImageUrl = product.previewImage;

  const uploadResult = await uploadImage({
    image: file,
    imageType: "product",
    uuid: uuid,
  });

  if (oldImageUrl && oldImageUrl !== uploadResult.secure_url) {
    await deleteAsset(oldImageUrl);
  }

  const [result] = await db
    .update(products)
    .set({
      previewImage: uploadResult.secure_url,
    })
    .returning();

  return {
    result,
  };
};

export const deleteProduct = async (uuid: string) => {
  await db.delete(products).where(eq(products.uuid, uuid));

  return;
};
