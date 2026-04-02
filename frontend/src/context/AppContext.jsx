import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productsAPI, salesAPI } from '../services/api';
import { generateId } from '../utils/helpers';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [cart, setCart] = useState([]);
  const [sessionId] = useState(() => generateId());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // ── Load initial data from API ──────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.message);
    }
  }, []);

  const fetchSales = useCallback(async () => {
    try {
      const data = await salesAPI.getAll();
      setSales(data);
    } catch (err) {
      console.error('Failed to fetch sales:', err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      /* eslint-disable react-hooks/set-state-in-effect -- clear cached data when session ends */
      setProducts([]);
      setSales([]);
      setCart([]);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }

    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchSales()]);
      setLoading(false);
    };
    init();
  }, [fetchProducts, fetchSales, isAuthenticated]);

  // ── Product Management ────────────────────────────────────────────────────
  const addProduct = async (productData) => {
    const created = await productsAPI.create(productData);
    setProducts(prev => [created, ...prev]);
    return created;
  };

  const updateProduct = async (id, updates) => {
    const updated = await productsAPI.update(id, updates);
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const deleteProduct = async (id) => {
    await productsAPI.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // ── Cart Management ───────────────────────────────────────────────────────
  const addToCart = (productId, quantity) => {
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');
    if (quantity < 1) throw new Error('Quantity must be at least 1');
    if (quantity > product.quantity) throw new Error(`Only ${product.quantity} items available in stock`);

    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.quantity)
          throw new Error(`Only ${product.quantity} items available in stock`);
        return prev.map(item =>
          item.productId === productId ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, {
        productId,
        productName: product.name,
        price: product.price,
        quantity,
        availableStock: product.quantity
      }];
    });
  };

  const updateCartItem = (productId, quantity) => {
    const product = products.find(p => p.id === productId);
    if (quantity < 1) throw new Error('Quantity must be at least 1');
    if (product && quantity > product.quantity)
      throw new Error(`Only ${product.quantity} items available in stock`);

    setCart(prev =>
      prev.map(item => item.productId === productId ? { ...item, quantity } : item)
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  // ── Sales ─────────────────────────────────────────────────────────────────
  const confirmSale = async ({ customerName = '', customerPhone = '' } = {}) => {
    if (cart.length === 0) throw new Error('Cart is empty');

    const items = cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    // Post to API — backend handles stock deduction atomically
    const sale = await salesAPI.create(items, sessionId, { customerName, customerPhone });

    // Refresh products (stock changed) and sales from server
    await Promise.all([fetchProducts(), fetchSales()]);

    setCart([]);
    return sale;
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getSales = (_role) => sales;

  const getLowStockProducts = () => products.filter(p => p.quantity < 5);

  const value = {
    products,
    cart,
    sales,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    confirmSale,
    getSales,
    getLowStockProducts,
    refreshProducts: fetchProducts,
    refreshSales: fetchSales,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
