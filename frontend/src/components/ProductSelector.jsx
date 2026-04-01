import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';

const ProductSelector = () => {
  const { products, addToCart } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState({});

  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.quantity > 0;
  });

  const handleQuantityChange = (productId, value) => {
    const numValue = parseInt(value) || 1;
    setQuantities(prev => ({ ...prev, [productId]: numValue }));
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    try {
      addToCart(product.id, quantity);
      // Reset quantity for this product
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-5">Select Products</h3>
      
      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products available</p>
        ) : (
          filteredProducts.map(product => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-600">{product.category || 'N/A'}</span>
                  <span className="text-sm font-medium text-primary-600">
                    {formatCurrency(product.price)}
                  </span>
                  <span className={`text-sm ${product.quantity < 5 ? 'text-danger-600 font-medium' : 'text-gray-600'}`}>
                    Stock: {product.quantity}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantities[product.id] || 1}
                  onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                />
                <button
                  onClick={() => handleAddToCart(product)}
                  className="btn btn-primary text-sm px-4 py-2"
                >
                  Add
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductSelector;
