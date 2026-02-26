// Predefined users for authentication
// Single source of truth for login validation

export const users = [
  {
    id: 'u1',
    name: 'Harsh',
    password: 'owner123',
    role: 'owner'
  },
  {
    id: 'u2',
    name: 'Priya',
    password: 'employee123',
    role: 'employee'
  }
];

// Helper function to validate credentials
export function validateCredentials(name, password) {
  const user = users.find(u => u.name === name && u.password === password);
  
  if (user) {
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
}
