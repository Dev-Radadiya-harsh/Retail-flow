// Utility helper functions for RetailFlow

// Generate unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Date helper: Check if date is today
export function isToday(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

// Date helper: Check if date is this week
export function isThisWeek(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  weekStart.setHours(0, 0, 0, 0);
  return date >= weekStart;
}

// Date helper: Check if date is this month
export function isThisMonth(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  return date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear();
}

// Validate product data
export function validateProduct(product) {
  const errors = {};
  
  if (!product.name || product.name.trim() === '') {
    errors.name = 'Product name is required';
  }
  
  if (product.price === undefined || product.price === null || product.price < 0) {
    errors.price = 'Price must be 0 or greater';
  }
  
  if (product.quantity === undefined || product.quantity === null || product.quantity < 0) {
    errors.quantity = 'Quantity must be 0 or greater';
  }
  
  if (product.quantity !== undefined && !Number.isInteger(Number(product.quantity))) {
    errors.quantity = 'Quantity must be a whole number';
  }
  
  return errors;
}

// Check if product is low on stock
export function isLowStock(product) {
  return product.quantity < 5;
}

// Calculate total for cart items
export function calculateCartTotal(cart) {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Format currency
export function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

// Format date and time
export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
