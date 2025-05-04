import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
/**
 * Upload file to Cloudinary
 * @param {String} filePath - Local path to file
 * @param {String} folderName - Cloudinary folder name
 * @param {String} resourceType - 'image' | 'video' | 'auto'
 * @returns {Promise<Object>} - Uploaded file details
 */
const cloudinaryUpload = async (filePath, folderName = 'uploads', resourceType = 'auto') => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
  try {
    let result;

    if (resourceType === 'video') {
      // For large videos, use chunked upload
      result = await cloudinary.uploader.upload_large(filePath, {
        resource_type: 'video',
        folder: folderName,
        chunk_size: 6000000, // 6 MB chunks
      });
    } else {
      // For images or small files
      result = await cloudinary.uploader.upload(filePath, {
        resource_type: resourceType,
        folder: folderName,
      });
    }
    // Remove local file after upload
    fs.unlinkSync(filePath);
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Cloudinary Upload Failed');
  }
};

export default cloudinaryUpload