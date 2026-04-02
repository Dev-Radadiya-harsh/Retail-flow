import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, calculateCartTotal } from '../utils/helpers';
import { jsPDF } from 'jspdf';

const BillingCart = ({ onSaleComplete }) => {
  const { cart, updateCartItem, removeFromCart, clearCart, confirmSale } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaleConfirm, setShowSaleConfirm] = useState(false);
  const [showBillActions, setShowBillActions] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const toast = useToast();

  const createBillText = (sale) => {
    const lines = [
      `RetailFlow Bill ${sale.billNumber || `#${sale.id.slice(0, 8).toUpperCase()}`}`,
      `Date: ${new Date(sale.dateTime).toLocaleString('en-IN')}`,
      `Customer: ${sale.customerName || 'Walk-in'}`,
      `Phone: ${sale.customerPhone || '-'}`,
      '',
      'Items:',
    ];

    sale.items.forEach((item) => {
      lines.push(`- ${item.productName} x${item.quantity} = ${formatCurrency(item.total)}`);
    });
    lines.push('', `Total: ${formatCurrency(sale.totalAmount ?? sale.total ?? 0)}`);
    return lines.join('\n');
  };

  const downloadBillPdf = (sale) => {
    const doc = new jsPDF();
    const top = 15;
    doc.setFontSize(16);
    doc.text('RetailFlow Bill', 14, top);
    doc.setFontSize(11);
    doc.text(`Bill No: ${sale.billNumber || sale.id}`, 14, top + 10);
    doc.text(`Date: ${new Date(sale.dateTime).toLocaleString('en-IN')}`, 14, top + 17);
    doc.text(`Customer: ${sale.customerName || 'Walk-in'}`, 14, top + 24);
    doc.text(`Phone: ${sale.customerPhone || '-'}`, 14, top + 31);

    let y = top + 42;
    doc.setFontSize(12);
    doc.text('Items', 14, y);
    y += 8;
    doc.setFontSize(10);
    sale.items.forEach((item) => {
      doc.text(`${item.productName} x${item.quantity}`, 14, y);
      doc.text(formatCurrency(item.total), 175, y, { align: 'right' });
      y += 6;
    });
    y += 4;
    doc.setFontSize(12);
    doc.text(`Total: ${formatCurrency(sale.totalAmount ?? sale.total ?? 0)}`, 14, y);
    doc.save(`${sale.billNumber || sale.id}.pdf`);
  };

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
      const sale = await confirmSale({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      });
      toast.success(`✅ Sale completed! ID: #${sale.id.substring(0, 8).toUpperCase()}`);
      setCompletedSale(sale);
      setShowBillActions(true);
      setCustomerName('');
      setCustomerPhone('');
      if (onSaleComplete) onSaleComplete(sale);
    } catch (error) {
      toast.error(`Sale failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCart = () => setShowClearConfirm(true);
  const executeClear = () => { clearCart(); setShowClearConfirm(false); toast.info('Cart cleared'); };

  const handleWhatsAppShare = (sale) => {
    if (!sale) return;
    if (!sale.customerPhone) {
      toast.warning('Customer WhatsApp number is missing for this bill');
      return;
    }
    const message = createBillText(sale);
    window.open(`https://wa.me/${sale.customerPhone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

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

            {/* Customer Details */}
            <div className="space-y-3 mb-6">
              <div>
                <label className="label block mb-1">Customer Name</label>
                <input
                  className="input"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="label block mb-1">Customer WhatsApp Number</label>
                <input
                  className="input"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Optional (e.g. 919876543210)"
                />
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

      {/* Post-sale share options */}
      {showBillActions && completedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🧾</div>
              <h3 className="text-lg font-semibold text-gray-900">Bill Created Successfully</h3>
              <p className="text-sm text-gray-500 mt-1">
                {completedSale.billNumber || `#${completedSale.id.substring(0, 8).toUpperCase()}`}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => downloadBillPdf(completedSale)}
                className="btn btn-outline"
              >
                Download Bill PDF
              </button>
              <button
                onClick={() => {
                  downloadBillPdf(completedSale);
                  handleWhatsAppShare(completedSale);
                }}
                className="btn btn-primary"
              >
                Share Bill PDF on WhatsApp
              </button>
              <button
                onClick={() => handleWhatsAppShare(completedSale)}
                className="text-sm text-green-700 hover:text-green-800"
              >
                Share Bill Text on WhatsApp
              </button>
              <button
                onClick={() => setShowBillActions(false)}
                className="text-sm text-gray-500 hover:text-gray-700 mt-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BillingCart;
