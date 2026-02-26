// Mock data for RetailFlow dashboards

export const ownerKPIs = {
  monthlyRevenue: {
    value: 245678,
    trend: '+12.5%',
    isPositive: true
  },
  itemsSoldMonthly: {
    value: 1847,
    trend: '+8.3%',
    isPositive: true
  },
  lowStockCount: {
    value: 23,
    trend: '-5',
    isPositive: true
  },
  inventoryHealth: {
    value: 87,
    trend: '+3%',
    isPositive: true
  }
};

export const employeeMetrics = {
  itemsSoldToday: {
    value: 67,
    trend: null
  },
  itemsSoldWeek: {
    value: 423,
    trend: null
  },
  lowStockAlerts: {
    value: 23,
    trend: null
  }
};

export const monthlyRevenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  values: [185000, 195000, 210000, 205000, 220000, 215000, 230000, 235000, 240000, 245000, 252000, 245678]
};

export const categorySalesData = {
  labels: ['Electronics', 'Clothing', 'Groceries', 'Home & Kitchen', 'Sports', 'Books'],
  values: [125000, 85000, 65000, 52000, 38000, 28000]
};

export const bestSellingProducts = [
  { id: 1, name: 'Wireless Mouse', category: 'Electronics', unitsSold: 287, revenue: 28700, stock: 145 },
  { id: 2, name: 'Cotton T-Shirt', category: 'Clothing', unitsSold: 245, revenue: 12250, stock: 89 },
  { id: 3, name: 'Rice (5kg)', category: 'Groceries', unitsSold: 223, revenue: 11150, stock: 456 },
  { id: 4, name: 'Coffee Maker', category: 'Home & Kitchen', unitsSold: 198, revenue: 39600, stock: 67 },
  { id: 5, name: 'Yoga Mat', category: 'Sports', unitsSold: 176, revenue: 8800, stock: 123 }
];

export const worstSellingProducts = [
  { id: 6, name: 'Vintage Clock', category: 'Home & Kitchen', unitsSold: 12, revenue: 2400, stock: 34 },
  { id: 7, name: 'Encyclopedia Set', category: 'Books', unitsSold: 15, revenue: 2250, stock: 45 },
  { id: 8, name: 'Ceramic Vase', category: 'Home & Kitchen', unitsSold: 18, revenue: 1800, stock: 28 },
  { id: 9, name: 'Chess Board', category: 'Sports', unitsSold: 21, revenue: 2310, stock: 56 },
  { id: 10, name: 'Wall Art', category: 'Home & Kitchen', unitsSold: 25, revenue: 3750, stock: 19 }
];

export const lowStockProducts = [
  { id: 11, name: 'HDMI Cable', category: 'Electronics', stock: 8, reorderLevel: 50, unitsSold: 156 },
  { id: 12, name: 'AA Batteries (4pk)', category: 'Electronics', stock: 12, reorderLevel: 100, unitsSold: 234 },
  { id: 13, name: 'Notebook A4', category: 'Books', stock: 15, reorderLevel: 80, unitsSold: 189 },
  { id: 14, name: 'Hand Sanitizer', category: 'Groceries', stock: 18, reorderLevel: 150, unitsSold: 298 },
  { id: 15, name: 'Dish Soap', category: 'Home & Kitchen', stock: 9, reorderLevel: 60, unitsSold: 167 }
];
