import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file buffer to Cloudinary
 * @param fileBuffer - File buffer from FormData
 * @param folder - Cloudinary folder path
 * @param resourceType - 'image' or 'raw' (for PDFs)
 * @param allowedFormats - Array of allowed file formats
 * @returns Cloudinary upload response with secure_url
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' = 'image',
  allowedFormats?: string[]
) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        allowed_formats: allowedFormats,
        max_file_size: resourceType === 'image' ? 5000000 : 10000000, // 5MB for images, 10MB for PDFs
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Delete file from Cloudinary
 * @param publicId - Cloudinary public_id of the file
 * @param resourceType - 'image' or 'raw'
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'raw' = 'image'
) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

/**
 * Extract public_id from Cloudinary URL
 * @param url - Cloudinary secure_url
 * @returns public_id
 */
export function getPublicIdFromUrl(url: string): string {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  
  // Include folder path if present
  const folderIndex = parts.indexOf('upload') + 2;
  const folders = parts.slice(folderIndex, -1).join('/');
  
  return folders ? `${folders}/${publicId}` : publicId;
}

export default cloudinary;
