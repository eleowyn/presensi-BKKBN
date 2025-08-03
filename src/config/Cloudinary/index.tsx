// Cloudinary configuration using REST API
// Replace these with your actual Cloudinary credentials
export const cloudinaryConfig = {
  cloud_name: 'dfloogh11', // Replace with your cloud name
  api_key: '343374756725828',       // Replace with your API key
  api_secret: 'iogA9VktT-0uXzPHPxk-gfxio4w', // Replace with your API secret
  upload_preset: 'my_unsigned', // Replace with your upload preset
};

// Cloudinary upload URL
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/upload`;

export default cloudinaryConfig;
