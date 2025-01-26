import db from "@db/index";
import { stores } from "@db/schema";
import { StoreDto, StoreUpdateDto, StoreVerifyDto } from "@dto/storeDto";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { API_MESSAGES } from "src/constants/application";
import { getUser } from "./userHandler";
import { userRoleUpdate } from "./userRoleHandler";
import { User, UserWithRelations } from "@db/schema/user";
import { deleteAsset, uploadImage } from "@utils/cloudinary";

export const getStores = async () => {
  const stores = await db.query.stores.findMany();

  return stores;
};

export const getStore = async ({
  uuid,
  storeUrlName,
}: {
  uuid?: string;
  storeUrlName?: string;
}) => {
  const store = await db.query.stores.findFirst({
    where: storeUrlName
      ? eq(stores.storeUrlName, storeUrlName)
      : eq(stores.uuid, uuid!),
  });

  return {
    store: store || null,
  };
};

export const newStore = async (user: UserWithRelations, request: StoreDto) => {
  const isStoreExists = await getStore({
    storeUrlName: request.storeName,
  });

  if (isStoreExists.store) {
    throw new HTTPException(409, {
      message: API_MESSAGES.FAILED_DATA_IS_EXISTS,
    });
  }

  const currentRoles = user.userRoles.map((ur) => ur.role.name);

  if (!currentRoles.includes("seller")) {
    await userRoleUpdate({
      newRoles: [...currentRoles, "seller"],
      userUuid: user.uuid,
    });
  }

  const [newStore] = await db
    .insert(stores)
    .values({
      userId: user.id,
      storeName: request.storeName,
      storeUrlName: request.storeName.split(" ").join("-"),
      storeAddress: request.storeAddress,
      storePhone: request.storePhone,
    })
    .returning();

  return {
    newStore,
  };
};

export const updateStore = async ({
  uuid,
  request,
}: {
  uuid: string;
  request: StoreUpdateDto;
}) => {
  const isStoreExists = await getStore({ uuid: uuid });

  if (!isStoreExists.store) {
    throw new HTTPException(404, {
      message: API_MESSAGES.FAILED_NOT_FOUND,
    });
  }

  const [updatedStore] = await db
    .update(stores)
    .set({
      storeName: request.storeName,
      storeAddress: request.storeAddress,
      storePhone: request.storePhone,
      profileImageUrl: request.profileImageUrl,
      bannerImageUrl: request.bannerImageUrl,
      operatingHours: request.operatingHours,
      storeUrlName:
        request.storeUrlName || request.storeName?.split(" ").join("-"),
    })
    .where(eq(stores.uuid, uuid))
    .returning();

  return {
    updatedStore,
  };
};

export const deleteStore = async (uuid: string) => {
  const isStoreExists = await getStore({ uuid: uuid });

  if (!isStoreExists.store) {
    throw new HTTPException(404, {
      message: API_MESSAGES.FAILED_NOT_FOUND,
    });
  }

  const [deletedUser] = await db
    .delete(stores)
    .where(eq(stores.uuid, uuid))
    .returning();

  return {
    deletedUser,
  };
};

export const verifyStore = async ({
  uuid,
  verify,
}: { uuid: string } & StoreVerifyDto) => {
  const isStoreExists = await getStore({ uuid: uuid });

  if (!isStoreExists.store) {
    throw new HTTPException(404, {
      message: API_MESSAGES.FAILED_NOT_FOUND,
    });
  }

  const [verifiedStore] = await db
    .update(stores)
    .set({
      isVerified: verify,
    })
    .where(eq(stores.uuid, uuid))
    .returning();

  return {
    verifiedStore,
  };
};

export const updateStoreImage = async (uuid: string, file: File) => {
  const isStoreExists = await getStore({ uuid: uuid });

  if (!isStoreExists.store) {
    throw new HTTPException(404, {
      message: API_MESSAGES.FAILED_NOT_FOUND,
    });
  }

  const uploadResult = await uploadImage({
    image: file,
    imageType: "store",
    uuid: uuid,
  });

  const oldPhotoUrl = isStoreExists.store.profileImageUrl;

  if (oldPhotoUrl && oldPhotoUrl !== uploadResult.secure_url) {
    await deleteAsset(oldPhotoUrl);
  }

  const [updatedStore] = await db
    .update(stores)
    .set({
      profileImageUrl: uploadResult.secure_url,
    })
    .where(eq(stores.uuid, isStoreExists.store.uuid))
    .returning();

  return {
    updatedStore,
  };
};

export const updateStoreBanner = async (uuid: string, file: File) => {
  const isStoreExists = await getStore({ uuid: uuid });

  if (!isStoreExists.store) {
    throw new HTTPException(404, {
      message: API_MESSAGES.FAILED_NOT_FOUND,
    });
  }

  const uploadResult = await uploadImage({
    image: file,
    imageType: "store",
    uuid: uuid,
  });

  const oldPhotoUrl = isStoreExists.store.bannerImageUrl;

  if (oldPhotoUrl && oldPhotoUrl !== uploadResult.secure_url) {
    await deleteAsset(oldPhotoUrl);
  }

  const [updatedStore] = await db
    .update(stores)
    .set({
      bannerImageUrl: uploadResult.secure_url,
    })
    .where(eq(stores.uuid, uuid))
    .returning();

  return {
    updatedStore,
  };
};
