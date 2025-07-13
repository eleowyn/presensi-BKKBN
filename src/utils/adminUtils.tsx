import {getAuth} from 'firebase/auth';

/**
 * Check if the current user is an admin
 * @returns boolean - true if current user is admin, false otherwise
 */
export const isCurrentUserAdmin = (): boolean => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user || !user.email) {
    return false;
  }
  
  const adminEmail = 'bkkbnsulutadmin@gmail.com';
  return user.email.toLowerCase() === adminEmail.toLowerCase();
};

/**
 * Check if a given email is the admin email
 * @param email - email to check
 * @returns boolean - true if email is admin email, false otherwise
 */
export const isAdminEmail = (email: string): boolean => {
  const adminEmail = 'bkkbnsulutadmin@gmail.com';
  return email.toLowerCase() === adminEmail.toLowerCase();
};
