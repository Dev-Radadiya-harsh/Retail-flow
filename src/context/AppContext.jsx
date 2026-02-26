import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateId, validateProduct, isLowStock, calculateCartTotal } from '../utils/helpers';

const AppContext = createContext();

// Initial sample products for demonstration
const initialProducts = [
  {
    id: 'p1',
    name: 'Wireless Mouse',
    price: 599,
    quantity: 145,
    category: 'Electronics',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p2',
    name: 'Cotton T-Shirt',
    price: 399,
    quantity: 89,
    category: 'Clothing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p3',
    name: 'Rice (5kg)',
    price: 250,
    quantity: 456,
    category: 'Groceries',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p4',
    name: 'Coffee Maker',
    price: 2499,
    quantity: 67,
    category: 'Home & Kitchen',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p5',
    name: 'Yoga Mat',
    price: 799,
    quantity: 123,
    category: 'Sports',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p6',
    name: 'LED Bulb (Pack of 4)',
    price: 299,
    quantity: 2,
    category: 'Electronics',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function AppProvider({ children }) {
  // Load state from localStorage or use defaults
  const loadState = () => {
    try {
      const saved = localStorage.getItem('retailflow_state');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
    return {
      products: initialProducts,
      sales: [],
      cart: [],
      sessionId: generateId()
    };
  };

  const [state, setState] = useState(loadState);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('retailflow_state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }, [state]);

  // Product Management Functions
  const addProduct = (productData) => {
    const errors = validateProduct(productData);
    if (Object.keys(errors).length > 0) {
      throw new Error(Object.values(errors).join(', '));
    }

    const newProduct = {
      id: generateId(),
      ...productData,
      price: Number(productData.price),
      quantity: Number(productData.quantity),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));

    return newProduct;
  };

  const updateProduct = (id, updates) => {
    const updatedData = { ...updates };
    const errors = validateProduct({ 
      name: updatedData.name, 
      price: updatedData.price, 
      quantity: updatedData.quantity 
    });
    
    if (Object.keys(errors).length > 0) {
      throw new Error(Object.values(errors).join(', '));
    }

    setState(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.id === id 
          ? { 
              ...p, 
              ...updatedData,
              price: Number(updatedData.price),
              quantity: Number(updatedData.quantity),
              updatedAt: new Date().toISOString() 
            }
          : p
      )
    }));
  };

  const deleteProduct = (id) => {
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  // Cart Management Functions
  const addToCart = (productId, quantity) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    if (quantity > product.quantity) {
      throw new Error(`Only ${product.quantity} items available in stock`);
    }

    setState(prev => {
      const existingItem = prev.cart.find(item => item.productId === productId);
      
      if (existingItem) {
        // Update existing cart item
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.quantity) {
          throw new Error(`Only ${product.quantity} items available in stock`);
        }
        
        return {
          ...prev,
          cart: prev.cart.map(item =>
            item.productId === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        };
      } else {
        // Add new cart item
        return {
          ...prev,
          cart: [...prev.cart, {
            productId,
            productName: product.name,
            price: product.price,
            quantity,
            availableStock: product.quantity
          }]
        };
      }
    });
  };

  const updateCartItem = (productId, quantity) => {
    const product = state.products.find(p => p.id === productId);
    
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    if (quantity > product.quantity) {
      throw new Error(`Only ${product.quantity} items available in stock`);
    }

    setState(prev => ({
      ...prev,
      cart: prev.cart.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    }));
  };

  const removeFromCart = (productId) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.productId !== productId)
    }));
  };

  const clearCart = () => {
    setState(prev => ({
      ...prev,
      cart: []
    }));
  };

  // Sales Management Functions
  const confirmSale = (generatedBy = 'employee') => {
    if (state.cart.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate stock availability for all items
    for (const item of state.cart) {
      const product = state.products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productName} no longer exists`);
      }
      if (item.quantity > product.quantity) {
        throw new Error(`Insufficient stock for ${item.productName}. Only ${product.quantity} available.`);
      }
    }

    // Create sale record
    const sale = {
      saleId: generateId(),
      dateTime: new Date().toISOString(),
      items: state.cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      })),
      subtotal: calculateCartTotal(state.cart),
      total: calculateCartTotal(state.cart),
      generatedBy,
      sessionId: state.sessionId
    };

    // Deduct stock
    setState(prev => ({
      ...prev,
      products: prev.products.map(product => {
        const cartItem = prev.cart.find(item => item.productId === product.id);
        if (cartItem) {
          return {
            ...product,
            quantity: product.quantity - cartItem.quantity,
            updatedAt: new Date().toISOString()
          };
        }
        return product;
      }),
      sales: [...prev.sales, sale],
      cart: []
    }));

    return sale;
  };

  // Get sales based on role
  const getSales = (role) => {
    if (role === 'owner') {
      return state.sales;
    }
    // Employee sees only sales from current session
    return state.sales.filter(sale => sale.sessionId === state.sessionId);
  };

  // Get products with low stock
  const getLowStockProducts = () => {
    return state.products.filter(isLowStock);
  };

  const value = {
    products: state.products,
    cart: state.cart,
    sales: state.sales,
    addProduct,
    updateProduct,
    deleteProduct,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    confirmSale,
    getSales,
    getLowStockProducts
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
