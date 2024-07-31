import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

/*
 * Uploads a local file to Cloudinary.
 *
 * @param {string} localFilePath - The path to the local file to be uploaded.
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 *  - success: Indicates whether the upload was successful.
 *  - data: The response from Cloudinary if the upload was successful.
 *  - error: An error message if the upload failed.
 */
export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      console.log("Invalid file path or file does not exist");
      return { success: false, error: "Invalid file path or file does not exist" };
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", 
    });
    console.log("File has been successfully uploaded", response.url);
    fs.unlinkSync(localFilePath);//unlink file from local storage
    return { success: true, data: response };
    
    
  } catch (error) {
    console.error("Error uploading file:", error);
    try {
      fs.unlink(localFilePath);
    } catch (unlinkError) {
      console.error("Error deleting temporary file:", unlinkError);
    }

    return { success: false, error: "Upload failed" };
  }
};

// Set your Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/*
 * Uploads a local file to Cloudinary.
 *
 * @param {string} localFilePath - The path to the local file to be uploaded.
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 *  - success: Indicates whether the upload was successful.
 *  - data: The response from Cloudinary if the upload was successful.
 *  - error: An error message if the upload failed.
 */
/*export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      console.log("Invalid file path or file does not exist");
      return { success: false, error: "Invalid file path or file does not exist" };
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", 
    });
    console.log("File has been successfully uploaded", response.url);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error uploading file:", error);
    try {
      fs.unlink(localFilePath);
    } catch (unlinkError) {
      console.error("Error deleting temporary file:", unlinkError);
    }
    return { success: false, error: "Upload failed" };
  }
};
*/