import { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, Users } from 'lucide-react';
import { Card } from '../ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Analytics() {
  const [analytics, setAnalytics] = useState({
    visitors: 0,
    sales: 0,
    revenue: 0
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const savedAnalytics = localStorage.getItem('analytics');
    if (savedAnalytics) {
      setAnalytics(JSON.parse(savedAnalytics));
    }

    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }

    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  };

  // Calculate real revenue from paid orders
  const totalRevenue = orders
    .filter((order: any) => order.status === 'paid')
    .reduce((sum: number, order: any) => sum + (parseFloat(order.total_amount || order.total) || 0), 0);
  
  // Calculate total sales count
  const totalSales = orders.filter((order: any) => order.status === 'paid').length;

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Sales',
      value: totalSales,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Total Revenue',
      value: `₹${Math.round(totalRevenue).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      title: 'Total Visitors',
      value: analytics.visitors,
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  const paidOrders = orders.filter((order: any) => order.status === 'paid').length;
  const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;

  // Real revenue trend data (last 7 days from actual orders)
  const getLast7DaysRevenue = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const dateStr = date.toDateString();

      // Calculate revenue for this day from actual orders
      const dayRevenue = orders
        .filter((order: any) => {
          const orderDate = new Date(order.created_at || order.createdAt);
          return orderDate.toDateString() === dateStr && order.status === 'paid';
        })
        .reduce((sum: number, order: any) => sum + (parseFloat(order.total_amount || order.total) || 0), 0);

      last7Days.push({
        day: dayName,
        revenue: Math.round(dayRevenue)
      });
    }

    return last7Days;
  };

  const revenueTrendData = getLast7DaysRevenue();

  // Order status pie chart data
  const orderStatusData = [
    { name: 'Approved', value: paidOrders, color: '#10b981' },
    { name: 'Pending', value: pendingOrders, color: '#f59e0b' }
  ];

  // Top products by actual order frequency
  const getTopProducts = () => {
    const productSales: any = {};
    
    orders.forEach((order: any) => {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      items.forEach((item: any) => {
        const productTitle = item.product_title || item.title || 'Unknown';
        productSales[productTitle] = (productSales[productTitle] || 0) + item.quantity;
      });
    });

    return Object.entries(productSales)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sales]) => ({
        name: name.length > 25 ? name.substring(0, 25) + '...' : name,
        sales: sales
      }));
  };

  const topProductsData = getTopProducts();

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Orders Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Orders Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Orders</span>
              <span className="text-gray-900">{orders.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending Orders</span>
              <span className="text-yellow-600">{pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed Orders</span>
              <span className="text-green-600">{paidOrders}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order: any, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Order {order.id}</span>
                <span className={`px-2 py-1 rounded ${
                  order.status === 'paid' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-gray-500 text-sm">No orders yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Revenue Trend (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Order Status Pie Chart */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Products Chart */}
      {topProductsData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            Top Selling Products
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
