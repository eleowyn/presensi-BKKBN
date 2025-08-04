import axios from 'axios';
import { CLOUDINARY_UPLOAD_URL, cloudinaryConfig, transformCloudinaryUrl, fixCloudinaryUrl } from '../config/Cloudinary';
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
    
    // Add resource type for non-image files
    formData.append('resource_type', 'auto');
    
    // Add folder for organization (optional)
    formData.append('folder', 'attendance_documents');
    
    // Add timestamp for unique naming
    const timestamp = Date.now();
    formData.append('public_id', `doc_${timestamp}_${file.name.split('.')[0]}`);

    console.log('Uploading file to Cloudinary:', file.name);

    // Upload to Cloudinary
    const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds timeout
    });

    if (response.data && response.data.secure_url) {
      // Transform the URL based on file type to ensure correct delivery
      const transformedUrl = transformCloudinaryUrl(response.data.secure_url, file.type);
      console.log('File uploaded successfully:', transformedUrl);
      console.log('Original URL:', response.data.secure_url);
      console.log('Transformed URL:', transformedUrl);
      return transformedUrl;
    } else {
      throw new Error('Upload failed: No URL returned from Cloudinary');
    }
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    
    let errorMessage = 'Failed to upload file';
    
    if (error.response) {
      // Server responded with error
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
