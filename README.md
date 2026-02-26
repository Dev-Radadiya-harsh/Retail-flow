# RetailFlow - Retail Management System

A professional, role-based retail management dashboard built with React, Tailwind CSS, and Chart.js for a final-year major project.

## 🎯 Features

### Owner Dashboard
- **4 KPI Cards**: Monthly Revenue, Items Sold, Low Stock Count, Inventory Health Score
- **2 Interactive Charts**: Monthly Revenue Trend (Line Chart), Category-wise Sales (Doughnut Chart)
- **3 Insight Tables**: Best-Selling Products, Worst-Selling Products, Low Stock Alerts
- **Full Analytics**: Complete visibility of financial and operational metrics

### Employee Dashboard
- **3 Summary Cards**: Items Sold Today, Items Sold This Week, Low Stock Alerts
- **2 Action Buttons**: Create Bill, Request Stock Update (UI only)
- **2 Product Tables**: Best-Selling and Worst-Selling Products
- **Privacy-Focused**: No revenue or profit information displayed

## 🛠️ Tech Stack

- **React** (Vite)
- **Tailwind CSS v3** - Professional admin-style design
- **Chart.js** + react-chartjs-2 - Data visualizations
- **React Router** - Navigation between dashboards
- **Mock Data Services** - Frontend-only implementation

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── KPICard.jsx
│   ├── DataTable.jsx
│   ├── ChartCard.jsx
│   ├── LineChart.jsx
│   ├── DoughnutChart.jsx
│   ├── Sidebar.jsx
│   └── Header.jsx
├── pages/            # Dashboard pages
│   ├── OwnerDashboard.jsx
│   └── EmployeeDashboard.jsx
├── layouts/          # Layout wrapper
│   └── DashboardLayout.jsx
├── services/         # Mock data
│   └── mockData.js
├── utils/            # Constants
│   └── constants.js
└── App.jsx           # Router setup
```

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at **http://localhost:5173/**

### Routes

- `/owner` - Owner Dashboard (Full analytics)
- `/employee` - Employee Dashboard (Operational view)
- `/` - Redirects to Owner Dashboard

## 🎨 Design Principles

- **Sober & Professional**: Clean admin-style interface
- **Single Accent Color**: Consistent blue theme
- **No Flashy Effects**: Focus on readability and clarity
- **Role-Based Access**: Different data visibility for owners vs employees
- **Desktop-First**: Responsive design optimized for admin use

## 📊 Mock Data

All data is stored in `src/services/mockData.js` and includes:
- KPI metrics with trend indicators
- 12-month revenue progression
- Product sales data (best/worst sellers)
- Category-wise sales breakdown
- Low stock alerts

## 🧩 Components

### Reusable Components
- **KPICard**: Metric display with icon, value, and trend
- **DataTable**: Customizable table with column rendering
- **ChartCard**: Wrapper for chart visualizations
- **LineChart**: Time-series revenue trends
- **DoughnutChart**: Category breakdowns

### Layout Components
- **Sidebar**: Navigation with branding
- **Header**: Page title and role indicator
- **DashboardLayout**: Complete layout wrapper

## 📝 Code Quality

- ✅ Modular component architecture
- ✅ Clean separation of concerns
- ✅ Centralized data management
- ✅ Tailwind utility-first styling
- ✅ No business logic in UI components
- ✅ Interview-ready code structure

## 🎓 Academic Project

This is a **frontend-only** implementation created for a final-year major project. It demonstrates:
- Professional UI/UX design
- React best practices
- Component reusability
- Role-based access control (UI level)
- Data visualization techniques

## 📦 Dependencies

```json
{
  "react": "^19",
  "react-router-dom": "^7",
  "tailwindcss": "^3",
  "chart.js": "^4",
  "react-chartjs-2": "^5"
}
```

## 🔧 Future Enhancements

- Backend API integration
- Authentication system
- Real-time data updates
- Export functionality (PDF/Excel)
- Advanced filtering and search
- Mobile responsive optimization

## 👥 User Roles

| Role | Access Level |
|------|-------------|
| **Owner** | Full access to financial and operational data |
| **Employee** | Operational data only, no revenue visibility |

## 📄 License

This is an academic project for educational purposes.

---

**Built with ❤️ for RetailFlow**
