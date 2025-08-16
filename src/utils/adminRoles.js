// Admin role management system
// For now, we'll use a simple hardcoded list of admin emails
// Later this can be moved to Supabase for dynamic management

// List of admin user emails
const ADMIN_EMAILS = [
  'admin@harbourlux.com',
  'kurtdon@gmail.com', // Add your email for testing
  'kurtdon42@gmail.com', // Your actual email address
  // Add more admin emails as needed
];

// Check if a user is an admin
export const isAdmin = (user) => {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
};

// Get user role
export const getUserRole = (user) => {
  if (!user) return 'guest';
  if (isAdmin(user)) return 'admin';
  return 'user';
};

// Check if user has permission for specific action
export const hasPermission = (user, permission) => {
  const role = getUserRole(user);
  
  // Debug logging
  console.log('🔍 Permission check:', {
    user: user?.email,
    permission,
    role,
    isAdmin: isAdmin(user),
    adminEmails: ADMIN_EMAILS
  });
  
  switch (permission) {
    case 'access_admin_panel':
      return role === 'admin';
    case 'approve_boats':
      return role === 'admin';
    case 'reject_boats':
      return role === 'admin';
    case 'view_all_bookings':
      return role === 'admin';
    case 'manage_users':
      return role === 'admin';
    default:
      return false;
  }
};

// Admin management functions (for future use)
export const addAdmin = (email) => {
  const normalizedEmail = email.toLowerCase();
  if (!ADMIN_EMAILS.includes(normalizedEmail)) {
    ADMIN_EMAILS.push(normalizedEmail);
    return true;
  }
  return false;
};

export const removeAdmin = (email) => {
  const normalizedEmail = email.toLowerCase();
  const index = ADMIN_EMAILS.indexOf(normalizedEmail);
  if (index > -1) {
    ADMIN_EMAILS.splice(index, 1);
    return true;
  }
  return false;
};

export const getAdminList = () => {
  return [...ADMIN_EMAILS];
}; 