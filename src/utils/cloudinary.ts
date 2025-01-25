import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  api_key: process.env.CLOUDINARY_KEY,
  cloud_name: process.env.CLOUD_NAME,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadImage = async (base64: string, fileType: string) => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  try {
    const result = await cloudinary.uploader.upload(
      `data:${fileType};base64,${base64}`,
      {
        ...options,
        folder: "todays-menu",
      }
    );

    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getAssetInfo = async (publicId: string) => {
  try {
    const result = await cloudinary.api.resource(publicId);

    return result;
  } catch (error) {
    return error;
  }
};

export { uploadImage, getAssetInfo };
