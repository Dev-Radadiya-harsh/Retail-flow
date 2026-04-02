import React, { useState, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import KPICard from '../components/KPICard';
import DataTable from '../components/DataTable';
import ProductSelector from '../components/ProductSelector';
import BillingCart from '../components/BillingCart';
import { useAppContext } from '../context/AppContext';
import { isToday, isThisWeek } from '../utils/helpers';

const EmployeeDashboard = () => {
  const { products, getSales, getLowStockProducts, loading } = useAppContext();
  const [showBilling, setShowBilling] = useState(false);

  // Get session sales (employee sees only their session sales)
  const sessionSales = getSales('employee');

  // Calculate metrics from session sales
  const metrics = useMemo(() => {
    const revenueToday = sessionSales
      .filter((sale) => isToday(sale.dateTime))
      .reduce((sum, sale) => sum + (sale.totalAmount ?? sale.total ?? 0), 0);

    const soldToday = sessionSales
      .filter(sale => isToday(sale.dateTime))
      .reduce((sum, sale) => {
        return sum + sale.items.reduce((s, item) => s + item.quantity, 0);
      }, 0);

    const soldWeek = sessionSales
      .filter(sale => isThisWeek(sale.dateTime))
      .reduce((sum, sale) => {
        return sum + sale.items.reduce((s, item) => s + item.quantity, 0);
      }, 0);

    const lowStockCount = getLowStockProducts().length;

    return {
      revenueToday,
      soldToday,
      soldWeek,
      lowStockCount
    };
  }, [sessionSales, getLowStockProducts]);

  // Calculate best/worst sellers from session sales
  const { bestSellers, worstSellers } = useMemo(() => {
    const productSales = {};
    
    sessionSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
      });
    });

    const salesArray = Object.entries(productSales).map(([id, data]) => {
      const product = products.find(p => p.id === id);
      return {
        id,
        name: data.name,
        category: product?.category || 'N/A',
        unitsSold: data.quantity,
        stock: product?.quantity || 0
      };
    });

    salesArray.sort((a, b) => b.unitsSold - a.unitsSold);

    return {
      bestSellers: salesArray.slice(0, 5).map((item, index) => ({ ...item, id: index + 1 })),
      worstSellers: salesArray.slice(-5).reverse().map((item, index) => ({ ...item, id: index + 1 }))
    };
  }, [products, sessionSales]);

  // Table columns (no revenue for employees)
  const productColumns = [
    { label: '#', key: 'id' },
    { label: 'Product Name', key: 'name' },
    { label: 'Category', key: 'category' },
    { label: 'Units Sold', key: 'unitsSold', render: (value) => value.toLocaleString() },
    { label: 'Stock', key: 'stock', render: (value) => value.toLocaleString() },
  ];

  const handleSaleComplete = () => {
    // Optionally refresh or show notification
    setShowBilling(false);
  };

  if (loading) {
    return (
      <DashboardLayout role="employee" pageTitle="Employee Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="employee" pageTitle="Employee Dashboard">
      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Today's Revenue"
          value={metrics.revenueToday}
          icon="💰"
          prefix="₹"
        />
        <KPICard
          title="Items Sold Today"
          value={metrics.soldToday}
          icon="📦"
        />
        <KPICard
          title="Items Sold This Week"
          value={metrics.soldWeek}
          icon="📊"
        />
        <KPICard
          title="Low Stock Alerts"
          value={metrics.lowStockCount}
          icon="⚠️"
        />
      </div>

      {/* Action Buttons Section */}
      <div className="flex flex-wrap gap-4 mb-10">
        <button 
          onClick={() => setShowBilling(!showBilling)}
          className="btn btn-primary"
        >
          <span className="mr-2">{showBilling ? '📊' : '➕'}</span>
          {showBilling ? 'Hide Billing' : 'Create Bill'}
        </button>
        <button className="btn btn-secondary">
          <span className="mr-2">📝</span>
          Request Stock Update
        </button>
      </div>

      {/* Billing Section (toggleable) */}
      {showBilling && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <ProductSelector />
          <BillingCart onSaleComplete={handleSaleComplete} />
        </div>
      )}

      {/* Product Insights Section */}
      <div className="space-y-6">
        {bestSellers.length > 0 ? (
          <DataTable
            title="Top 5 Best-Selling Products (Your Session)"
            columns={productColumns}
            data={bestSellers}
          />
        ) : (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Top 5 Best-Selling Products (Your Session)</h3>
            <p className="text-gray-500 text-center py-8">No sales recorded in this session yet</p>
          </div>
        )}
        
        {worstSellers.length > 0 && (
          <DataTable
            title="Top 5 Worst-Selling Products (Your Session)"
            columns={productColumns}
            data={worstSellers}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
