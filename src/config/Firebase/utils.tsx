import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// Get current user data from Firebase
export const getCurrentUserData = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      throw new Error('User data not found');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

// Update user data in Firebase
export const updateUserData = async (userData: any) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    
    await update(userRef, {
      ...userData,
      updatedAt: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};

// Create user profile data structure
export const createUserProfile = (userCredential: any, additionalData: any) => {
  const currentDate = new Date();
  
  return {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    createdAt: currentDate.toISOString(),
    startDate: currentDate.toISOString(),
    joinedDate: currentDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    isActive: true,
    statistics: {
      weekly: {
        attendance: 0,
        late: 0,
        excused: 0,
        unexcused: 0
      },
      overall: {
        attendance: 0,
        late: 0,
        excused: 0,
        unexcused: 0
      }
    },
    ...additionalData
  };
};

// Format date for display
export const formatDate = (dateString: string) => {
  if (!dateString) return 'Not available';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

// Get user's first name
export const getFirstName = (fullName: string) => {
  if (!fullName) return 'User';
  return fullName.split(' ')[0];
};

// Save profile picture as base64 to Firebase Database
export const saveProfilePictureBase64 = async (base64Image: string) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    
    await update(userRef, {
      profilePictureBase64: base64Image,
      updatedAt: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.error('Error saving profile picture:', error);
    throw error;
  }
};

// Get user profile picture base64
export const getUserProfilePicture = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return userData.profilePictureBase64 || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting profile picture:', error);
    throw error;
  }
};

// Upload profile picture to Firebase Storage (keeping for backward compatibility)
export const uploadProfilePicture = async (imageUri: string) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Create storage reference
    const storage = getStorage();
    const imageRef = storageRef(storage, `profile-pictures/${user.uid}/${Date.now()}.jpg`);
    
    // Upload image
    const snapshot = await uploadBytes(imageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

// Update user profile picture URL in database (keeping for backward compatibility)
export const updateUserProfilePicture = async (profilePictureURL: string) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    
    await update(userRef, {
      profilePicture: profilePictureURL,
      updatedAt: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.error('Error updating profile picture:', error);
    throw error;
  }
};
