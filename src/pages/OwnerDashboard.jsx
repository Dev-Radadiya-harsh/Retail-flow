import React, { useState, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import KPICard from '../components/KPICard';
import DataTable from '../components/DataTable';
import ChartCard from '../components/ChartCard';
import LineChart from '../components/LineChart';
import DoughnutChart from '../components/DoughnutChart';
import ProductModal from '../components/ProductModal';
import { useAppContext } from '../context/AppContext';
import { isThisMonth, formatCurrency, isLowStock } from '../utils/helpers';

const OwnerDashboard = () => {
  const { products, sales, addProduct, updateProduct, deleteProduct } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalMode, setModalMode] = useState('add');

  // Calculate KPIs from real data
  const kpis = useMemo(() => {
    const monthlySales = sales.filter(sale => isThisMonth(sale.dateTime));
    
    const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + sale.total, 0);
    const itemsSold = monthlySales.reduce((sum, sale) => {
      return sum + sale.items.reduce((s, item) => s + item.quantity, 0);
    }, 0);
    const lowStockCount = products.filter(isLowStock).length;
    
    // Calculate inventory health (percentage of products with sufficient stock)
    const healthyProducts = products.filter(p => p.quantity >= 10).length;
    const inventoryHealth = products.length > 0 
      ? Math.round((healthyProducts / products.length) * 100) 
      : 0;

    return {
      monthlyRevenue,
      itemsSold,
      lowStockCount,
      inventoryHealth
    };
  }, [products, sales]);

  // Calculate best and worst sellers
  const { bestSellers, worstSellers } = useMemo(() => {
    const productSales = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
      });
    });

    const salesArray = Object.entries(productSales).map(([id, data]) => {
      const product = products.find(p => p.id === id);
      return {
        id,
        name: data.name,
        category: product?.category || 'N/A',
        unitsSold: data.quantity,
        revenue: data.revenue,
        stock: product?.quantity || 0
      };
    });

    salesArray.sort((a, b) => b.unitsSold - a.unitsSold);

    return {
      bestSellers: salesArray.slice(0, 5).map((item, index) => ({ ...item, id: index + 1 })),
      worstSellers: salesArray.slice(-5).reverse().map((item, index) => ({ ...item, id: index + 1 }))
    };
  }, [products, sales]);

  // Get low stock products
  const lowStockItems = useMemo(() => {
    return products
      .filter(isLowStock)
      .map((product, index) => ({
        id: index + 1,
        name: product.name,
        category: product.category || 'N/A',
        stock: product.quantity,
        reorderLevel: 10,
        unitsSold: 0 // Could calculate from sales if needed
      }));
  }, [products]);

  // Chart data from real sales
  const chartData = useMemo(() => {
    // Revenue trend for last 12 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const revenueByMonth = new Array(12).fill(0);
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.dateTime);
      const monthIndex = saleDate.getMonth();
      revenueByMonth[monthIndex] += sale.total;
    });

    // Category sales
    const categorySales = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const category = product?.category || 'Other';
        categorySales[category] = (categorySales[category] || 0) + item.total;
      });
    });

    return {
      revenue: {
        labels: monthNames,
        values: revenueByMonth
      },
      categories: {
        labels: Object.keys(categorySales),
        values: Object.values(categorySales)
      }
    };
  }, [products, sales]);

  // Handlers
  const handleAddProduct = () => {
    setModalMode('add');
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (formData) => {
    try {
      if (modalMode === 'add') {
        addProduct(formData);
      } else {
        updateProduct(editingProduct.id, formData);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
    }
  };

  // Table columns
  const  productColumns = [
    { label: '#', key: 'id' },
    { label: 'Product Name', key: 'name' },
    { label: 'Category', key: 'category' },
    { label: 'Units Sold', key: 'unitsSold', render: (value) => value.toLocaleString() },
    { label: 'Revenue', key: 'revenue', render: (value) => formatCurrency(value) },
    { label: 'Stock', key: 'stock', render: (value) => value.toLocaleString() },
  ];

  const lowStockColumns = [
    { label: '#', key: 'id' },
    { label: 'Product Name', key: 'name' },
    { label: 'Category', key: 'category' },
    { label: 'Current Stock', key: 'stock', render: (value) => <span className="text-danger-600 font-semibold">{value}</span> },
    { label: 'Reorder Level', key: 'reorderLevel' },
  ];

  const inventoryColumns = [
    { label: 'Product Name', key: 'name' },
    { label: 'Category', key: 'category', render: (value) => value || 'N/A' },
    { label: 'Price', key: 'price', render: (value) => formatCurrency(value) },
    { label: 'Stock', key: 'quantity', render: (value, row) => (
      <span className={isLowStock(row) ? 'text-danger-600 font-semibold' : ''}>
        {value}
        {isLowStock(row) && ' ⚠️'}
      </span>
    )},
    { 
      label: 'Actions', 
      key: 'id', 
      render: (id, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditProduct(row)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteProduct(id)}
            className="text-danger-600 hover:text-danger-700 font-medium text-sm"
          >
            Delete
          </button>
        </div>
      )
    },
  ];

  return (
    <DashboardLayout role="owner" pageTitle="Owner Dashboard">
      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPICard
          title="Monthly Revenue"
          value={kpis.monthlyRevenue}
          icon="💰"
          prefix="₹"
        />
        <KPICard
          title="Items Sold (Monthly)"
          value={kpis.itemsSold}
          icon="📦"
        />
        <KPICard
          title="Low Stock Products"
          value={kpis.lowStockCount}
          icon="⚠️"
        />
        <KPICard
          title="Inventory Health Score"
          value={kpis.inventoryHealth}
          icon="📊"
          suffix="%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <ChartCard title="Monthly Revenue Trend">
          <LineChart 
            data={chartData.revenue.values} 
            labels={chartData.revenue.labels} 
          />
        </ChartCard>
        <ChartCard title="Category-wise Sales">
          <DoughnutChart 
            data={chartData.categories.values} 
            labels={chartData.categories.labels} 
          />
        </ChartCard>
      </div>

      {/* Product Management Section */}
      <div className="mb-10">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Product Inventory</h3>
            <button onClick={handleAddProduct} className="btn btn-primary">
              <span className="mr-2">+</span>
              Add Product
            </button>
          </div>
          <div className="overflow-x-auto -mx-6">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {inventoryColumns.map((column, index) => (
                      <th
                        key={index}
                        className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {products.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
                      {inventoryColumns.map((column, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Insight Tables Section */}
      <div className="space-y-6">
        {bestSellers.length > 0 && (
          <DataTable
            title="Top 5 Best-Selling Products"
            columns={productColumns}
            data={bestSellers}
          />
        )}
        {worstSellers.length > 0 && (
          <DataTable
            title="Top 5 Worst-Selling Products"
            columns={productColumns}
            data={worstSellers}
          />
        )}
        {lowStockItems.length > 0 && (
          <DataTable
            title="Low Stock / Near Out-of-Stock Products"
            columns={lowStockColumns}
            data={lowStockItems}
          />
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        mode={modalMode}
      />
    </DashboardLayout>
  );
};

export default OwnerDashboard;
