import axios from 'axios';
import { cloudinaryConfig, fixCloudinaryUrl } from '../config/Cloudinary';
import { showMessage } from 'react-native-flash-message';

// Supported file types
export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
];

// File type extensions mapping
export const FILE_EXTENSIONS = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
};

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Validate file type and size
export const validateFile = (file: any): { isValid: boolean; error?: string } => {
  // Check file type
  if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported. Please select PDF, DOC, or DOCX files only.',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File size too large. Maximum size allowed is 5MB.',
    };
  }

  return { isValid: true };
};

// Upload file to Cloudinary
export const uploadFileToCloudinary = async (file: any): Promise<string> => {
  try {
    // Create FormData
    const formData = new FormData();
    
    // Add file to FormData
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);
    
    // Add upload preset
    formData.append('upload_preset', cloudinaryConfig.upload_preset);
    
    // Add resource type for non-image files (use 'raw' for documents)
    formData.append('resource_type', 'raw');
    
    // Add folder for organization (optional)
    formData.append('folder', 'attendance_documents');
    
    // Add timestamp for unique naming
    const timestamp = Date.now();
    const cleanFileName = file.name.split('.')[0]
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 50); // Limit length to avoid issues
    
    const publicId = `doc_${timestamp}_${cleanFileName}`;
    formData.append('public_id', publicId);
    
    console.log('Generated public_id:', publicId);
    console.log('Uploading file to Cloudinary:', file.name);
    console.log('Resource type: raw');

    // Use the raw upload URL for documents
    const rawUploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/raw/upload`;
    console.log('Upload URL:', rawUploadUrl);

    // Upload to Cloudinary using raw endpoint
    const response = await axios.post(rawUploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds timeout
    });

    if (response.data && response.data.secure_url) {
      console.log('File uploaded successfully:', response.data.secure_url);
      console.log('Resource type from response:', response.data.resource_type);
      
      // The URL should already be correct since we used the raw endpoint
      return response.data.secure_url;
    } else {
      throw new Error('Upload failed: No URL returned from Cloudinary');
    }
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    
    let errorMessage = 'Failed to upload file';
    
    if (error.response) {
      // Server responded with error
      console.error('Error response data:', error.response.data);
      errorMessage = `Upload failed: ${error.response.data?.error?.message || error.response.statusText}`;
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error: Please check your internet connection';
    } else {
      // Other error
      errorMessage = error.message || 'Unknown upload error';
    }
    
    throw new Error(errorMessage);
  }
};

// Get file info for display
export const getFileDisplayInfo = (file: any) => {
  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  const extension = FILE_EXTENSIONS[file.type as keyof typeof FILE_EXTENSIONS] || 'unknown';
  
  return {
    name: file.name,
    size: `${sizeInMB} MB`,
    extension: extension.toUpperCase(),
    type: file.type,
  };
};

// Show file upload success message
export const showUploadSuccessMessage = (fileName: string) => {
  showMessage({
    message: 'File Uploaded Successfully!',
    description: `${fileName} has been uploaded to cloud storage.`,
    type: 'success',
    duration: 3000,
  });
};

// Show file upload error message
export const showUploadErrorMessage = (error: string) => {
  showMessage({
    message: 'Upload Failed',
    description: error,
    type: 'danger',
    duration: 5000,
  });
};

// Fix existing Cloudinary URLs that might be using wrong delivery type
// This is useful for URLs that were stored before the fix was implemented
export const fixExistingCloudinaryUrl = (url: string, fileType: string): string => {
  return fixCloudinaryUrl(url, fileType);
};

// Helper function to determine file type from URL or filename
export const getFileTypeFromUrl = (url: string): string => {
  if (!url) return 'unknown';
  
  // Extract file extension from URL
  const urlParts = url.split('.');
  const extension = urlParts[urlParts.length - 1]?.toLowerCase().split('?')[0];
  
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':
      return 'application/msword';
    default:
      return 'unknown';
  }
};

// Utility to fix any Cloudinary URL based on its file extension
export const autoFixCloudinaryUrl = (url: string): string => {
  const fileType = getFileTypeFromUrl(url);
  return fixExistingCloudinaryUrl(url, fileType);
};

// Fix broken Cloudinary URLs that might have wrong resource type
// This specifically handles URLs that were uploaded with wrong resource_type
export const fixBrokenCloudinaryUrl = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // If URL contains /image/upload/ but should be /raw/upload/ for documents
  if (url.includes('/image/upload/')) {
    const fileType = getFileTypeFromUrl(url);
    if (SUPPORTED_FILE_TYPES.includes(fileType)) {
      return url.replace('/image/upload/', '/raw/upload/');
    }
  }

  return url;
};

// Test if a Cloudinary URL is accessible
export const testCloudinaryUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('URL test failed:', error);
    return false;
  }
};

// Auto-fix and test Cloudinary URL
export const autoFixAndTestUrl = async (url: string): Promise<string> => {
  // First try the original URL
  const isOriginalWorking = await testCloudinaryUrl(url);
  if (isOriginalWorking) {
    return url;
  }

  // Try fixing the URL
  const fixedUrl = fixBrokenCloudinaryUrl(url);
  const isFixedWorking = await testCloudinaryUrl(fixedUrl);
  
  if (isFixedWorking) {
    console.log('Fixed broken Cloudinary URL:', { original: url, fixed: fixedUrl });
    return fixedUrl;
  }

  // If neither works, return the fixed URL anyway (it's more likely to be correct)
  console.warn('Could not verify Cloudinary URL, returning fixed version:', fixedUrl);
  return fixedUrl;
};
