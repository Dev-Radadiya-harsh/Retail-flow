import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, calculateCartTotal } from '../utils/helpers';

const BillingCart = ({ onSaleComplete }) => {
  const { cart, updateCartItem, removeFromCart, clearCart, confirmSale } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaleConfirm, setShowSaleConfirm] = useState(false);
  const toast = useToast();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      updateCartItem(productId, newQuantity);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleConfirmSale = async () => {
    if (cart.length === 0) {
      toast.warning('Your cart is empty');
      return;
    }
    setShowSaleConfirm(true);
  };

  const executeSale = async () => {
    setShowSaleConfirm(false);
    setIsProcessing(true);
    try {
      const sale = await confirmSale();
      toast.success(`✅ Sale completed! ID: #${sale.id.substring(0, 8).toUpperCase()}`);
      if (onSaleComplete) onSaleComplete(sale);
    } catch (error) {
      toast.error(`Sale failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCart = () => setShowClearConfirm(true);
  const executeClear = () => { clearCart(); setShowClearConfirm(false); toast.info('Cart cleared'); };

  const total = calculateCartTotal(cart);

  return (
    <>
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
                <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                      >−</button>
                      <span className="px-3 py-1 min-w-[3rem] text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-gray-100"
                        disabled={item.quantity >= item.availableStock}
                      >+</button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-600 px-2"
                      title="Remove item"
                    >🗑️</button>
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
              <button onClick={handleClearCart} className="btn btn-outline flex-1" disabled={isProcessing}>
                Clear Cart
              </button>
              <button onClick={handleConfirmSale} className="btn btn-primary flex-1" disabled={isProcessing}>
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Processing...
                  </span>
                ) : 'Confirm Sale'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Sale Confirmation Dialog */}
      {showSaleConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Sale</h3>
              <p className="text-gray-500 mt-1 text-sm">
                Total: <span className="font-bold text-primary-600">{formatCurrency(total)}</span> for {cart.length} item type{cart.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSaleConfirm(false)} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={executeSale} className="btn btn-primary flex-1">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="text-lg font-semibold text-gray-900">Clear Cart?</h3>
              <p className="text-gray-500 mt-1 text-sm">All {cart.length} items will be removed.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="btn btn-outline flex-1">Keep Items</button>
              <button onClick={executeClear} className="btn btn-primary flex-1">Clear All</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BillingCart;
