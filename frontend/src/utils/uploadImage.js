import axiosInstance from "./axiosInstance";
import { API_PATHS } from "./apiPaths";

/**
 * Upload an image file to the server
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<string>} - Returns the uploaded image URL
 */
export const uploadImage = async (imageFile) => {
  if (!imageFile) {
    throw new Error("No image file provided");
  }

  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await axiosInstance.post(
      API_PATHS.IMAGE.UPLOAD_IMAGE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.imageUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
