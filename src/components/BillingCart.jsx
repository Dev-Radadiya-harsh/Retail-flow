import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, calculateCartTotal } from '../utils/helpers';

const BillingCart = ({ onSaleComplete }) => {
  const { cart, updateCartItem, removeFromCart, clearCart, confirmSale } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      updateCartItem(productId, newQuantity);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleConfirmSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (!window.confirm('Confirm this sale?')) {
      return;
    }

    setIsProcessing(true);
    try {
      const sale = confirmSale('employee');
      alert(`Sale completed successfully! Sale ID: ${sale.saleId.substring(0, 8)}`);
      if (onSaleComplete) {
        onSaleComplete(sale);
      }
    } catch (error) {
      alert(`Sale failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Clear all items from cart?')) {
      clearCart();
    }
  };

  const total = calculateCartTotal(cart);

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-5">Billing Cart</h3>

      {cart.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">🛒 Cart is empty</p>
          <p className="text-sm">Add products to create a bill</p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {cart.map(item => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.productName}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      className="px-2 py-1 hover:bg-gray-100"
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="px-3 py-1 min-w-[3rem] text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      className="px-2 py-1 hover:bg-gray-100"
                      disabled={item.quantity >= item.availableStock}
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-danger-600 hover:text-danger-700 px-2"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-primary-600">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClearCart}
              className="btn btn-outline flex-1"
              disabled={isProcessing}
            >
              Clear Cart
            </button>
            <button
              onClick={handleConfirmSale}
              className="btn btn-primary flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm Sale'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BillingCart;
