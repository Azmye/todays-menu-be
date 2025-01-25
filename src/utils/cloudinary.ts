import { User } from "@db/schema/user";
import { v2 as cloudinary } from "cloudinary";
import { HTTPException } from "hono/http-exception";
import { API_MESSAGES } from "src/constants/application";
import { encodeBase64 } from "hono/utils/encode";
import { extractPublicId } from "cloudinary-build-url";

cloudinary.config({
  api_key: process.env.CLOUDINARY_KEY,
  cloud_name: process.env.CLOUD_NAME,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadImage = async ({
  image,
  user,
  imageType,
}: {
  image: File;
  user: User;
  imageType: "profile" | "product";
}) => {
  const options = {
    unique_filename: true,
    overwrite: false,
  };

  const byteArrayBuffer = await image.arrayBuffer();
  const base64 = encodeBase64(byteArrayBuffer);

  try {
    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64}`,
      {
        ...options,
        folder: `${user.username}/${imageType}`,
        public_id: `profile-${image.name.split(".")[0]}`,
      }
    );

    return result;
  } catch (error: any) {
    throw new HTTPException(400, {
      message: error,
    });
  }
};

const getAssetInfo = async (publicId: string) => {
  try {
    const result = await cloudinary.api.resource(publicId);

    return result;
  } catch (error) {
    throw new HTTPException(404, {
      message: API_MESSAGES.FAILED_NOT_FOUND,
    });
  }
};

const deleteAsset = async (secure_url: string) => {
  const publicId = extractPublicId(secure_url);
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    return result;
  } catch (error) {
    throw new HTTPException(409, {
      message: "File failed to delete",
    });
  }
};

export { uploadImage, getAssetInfo, deleteAsset };
