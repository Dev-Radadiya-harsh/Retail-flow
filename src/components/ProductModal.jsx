import React, { useState, useEffect } from 'react';

const ProductModal = ({ isOpen, onClose, onSave, product = null, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    category: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        quantity: product.quantity || '',
        category: product.category || ''
      });
    } else {
      setFormData({
        name: '',
        price: '',
        quantity: '',
        category: ''
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      newErrors.price = 'Price must be 0 or greater';
    }
    
    if (formData.quantity === '' || isNaN(formData.quantity) || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity must be 0 or greater';
    }
    
    if (formData.quantity !== '' && !Number.isInteger(Number(formData.quantity))) {
      newErrors.quantity = 'Quantity must be a whole number';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="label block mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input ${errors.name ? 'border-danger-500' : ''}`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-danger-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="label block mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`input ${errors.price ? 'border-danger-500' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.price && (
                <p className="text-danger-600 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="quantity" className="label block mb-2">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={`input ${errors.quantity ? 'border-danger-500' : ''}`}
                placeholder="0"
                min="0"
                step="1"
              />
              {errors.quantity && (
                <p className="text-danger-600 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="label block mb-2">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Electronics, Clothing"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {mode === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
