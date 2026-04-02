import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { salesAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { downloadBillPdf, shareBillPdfOnWhatsApp } from '../utils/billPdf';

const FILTERS = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'All Time', days: 0 },
];

const BillsHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(30);
  const [expanded, setExpanded] = useState(null);
  const { user } = useAuth();
  const toast = useToast();

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const data = await salesAPI.getAll();
      setSales(data);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const filtered = useMemo(() => {
    if (filter === 0) return sales;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - filter);
    return sales.filter((s) => new Date(s.dateTime) >= cutoff);
  }, [sales, filter]);

  const title = user?.role === 'employee' ? 'My Bill History' : 'Bills History';

  return (
    <DashboardLayout role={user?.role} pageTitle={title}>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 mt-1">
            {user?.role === 'employee' ? 'Bills created by you' : 'All customer bills'}
          </p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.days}
              onClick={() => setFilter(f.days)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                filter === f.days ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Bills</h3>
          <span className="text-sm text-gray-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading bills...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">🧾</p>
            <p className="font-medium">No bills found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Bill', 'Customer', 'Date', 'Items', 'Total', 'Actions', ''].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((sale) => {
                  const isExp = expanded === sale.id;
                  const date = new Date(sale.dateTime);
                  const itemCount = sale.items.reduce((s, i) => s + i.quantity, 0);
                  return (
                    <React.Fragment key={sale.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                          {sale.billNumber || `#${sale.id.substring(0, 8).toUpperCase()}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          <div className="font-medium">{sale.customerName || 'Walk-in'}</div>
                          <div className="text-xs text-gray-500">{sale.customerPhone || 'No phone'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>{date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          <div className="text-xs text-gray-400">{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatCurrency(sale.totalAmount ?? sale.total ?? 0)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => downloadBillPdf(sale)}
                              className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                              PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => shareBillPdfOnWhatsApp(sale, { toast })}
                              className="text-green-600 hover:text-green-700 font-medium"
                            >
                              WhatsApp
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setExpanded(isExp ? null : sale.id)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            {isExp ? 'Hide ▲' : 'Details ▼'}
                          </button>
                        </td>
                      </tr>
                      {isExp && (
                        <tr className="bg-primary-50/40">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Line Items</div>
                            <div className="space-y-1.5">
                              {sale.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700">{item.productName}</span>
                                  <span className="text-gray-500 mx-4">× {item.quantity}</span>
                                  <span className="font-medium text-gray-900">{formatCurrency(item.total)}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BillsHistory;

