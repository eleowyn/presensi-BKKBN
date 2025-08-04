// Cloudinary configuration using REST API
// Replace these with your actual Cloudinary credentials
export const cloudinaryConfig = {
  cloud_name: 'dfloogh11', // Replace with your cloud name
  api_key: '343374756725828',       // Replace with your API key
  api_secret: 'iogA9VktT-0uXzPHPxk-gfxio4w', // Replace with your API secret
  upload_preset: 'ml_default', // Replace with your upload preset
};

// Cloudinary upload URL
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/upload`;

// File types that should use raw delivery instead of image delivery
export const RAW_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
];

// Detect if a file type should use raw delivery
export const shouldUseRawDelivery = (fileType: string): boolean => {
  return RAW_FILE_TYPES.includes(fileType);
};

// Transform Cloudinary URL based on file type
export const transformCloudinaryUrl = (url: string, fileType: string): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // If it's a file type that should use raw delivery
  if (shouldUseRawDelivery(fileType)) {
    // Transform /image/upload/ to /raw/upload/
    return url.replace('/image/upload/', '/raw/upload/');
  }

  return url;
};

// Get the correct delivery type for a file
export const getDeliveryType = (fileType: string): 'image' | 'raw' => {
  return shouldUseRawDelivery(fileType) ? 'raw' : 'image';
};

// Build Cloudinary URL with correct delivery type
export const buildCloudinaryUrl = (
  publicId: string, 
  fileType: string, 
  version?: string
): string => {
  const deliveryType = getDeliveryType(fileType);
  const versionPart = version ? `v${version}/` : '';
  
  return `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/${deliveryType}/upload/${versionPart}${publicId}`;
};

// Extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string | null => {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }

  try {
    // Match pattern: .../upload/v{version}/{public_id}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

// Fix existing Cloudinary URLs that might be using wrong delivery type
export const fixCloudinaryUrl = (url: string, fileType: string): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const publicId = extractPublicId(url);
  if (!publicId) {
    // Fallback to simple transformation
    return transformCloudinaryUrl(url, fileType);
  }

  // Extract version if present
  const versionMatch = url.match(/\/v(\d+)\//);
  const version = versionMatch ? versionMatch[1] : undefined;

  // Rebuild URL with correct delivery type
  return buildCloudinaryUrl(publicId, fileType, version);
};

export default cloudinaryConfig;
