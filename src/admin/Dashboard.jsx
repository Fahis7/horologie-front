import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../common/context/Authprovider";
import API from "../../api/Api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  Package,
  DollarSign,
  Clock,
  AlertCircle,
  Eye,
  MoreVertical,
  RefreshCw,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Award,
  Star,
  Shield,
  ChevronRight,
  Filter,
  X
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
    revenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    conversionRate: 0,
    avgOrderValue: 0
  });
  
  const [brandData, setBrandData] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [timeRange, setTimeRange] = useState("week");
  const [showFilters, setShowFilters] = useState(false);
  const { logout } = useContext(AuthContext);

  // Define color palette
  const COLORS = ["#B8860B", "#DAA520", "#CD853F", "#8B4513", "#A0522D", "#DEB887", "#F4A460", "#D2691E"];

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Stats
      const statsRes = await API.get("/auth/admin/stats/");
      const statsData = statsRes.data;

      setStats({
        users: statsData.total_users || 0,
        orders: statsData.total_orders || 0,
        products: statsData.total_products || 0,
        revenue: statsData.total_revenue || 0,
        pendingOrders: statsData.pending_orders || 0,
        lowStockProducts: statsData.low_stock_products || 0,
        conversionRate: statsData.conversion_rate || 0,
        avgOrderValue: statsData.avg_order_value || 0
      });

      // 2. Fetch Products for Brand Distribution
      const productsRes = await API.get("/products/");
      const products = productsRes.data;
      
      // Calculate brand distribution from real products
      const brandDistribution = calculateBrandDistribution(products);
      setBrandData(brandDistribution);

      // 3. Fetch Orders for Sales Data
      const ordersRes = await API.get("/orders/admin/all/");
      const orders = ordersRes.data;
      
      // Calculate sales trend from real orders
      const salesTrendData = calculateSalesTrend(orders, timeRange);
      setSalesTrend(salesTrendData);

      // 4. Calculate revenue data
      const revenueData = calculateRevenueData(orders);
      setRevenueData(revenueData);

      // 5. Get top selling products
      const topProductsData = calculateTopProducts(orders, products);
      setTopProducts(topProductsData.slice(0, 5));

      // 6. Get recent orders
      const sortedOrders = [...orders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentOrders(sortedOrders);

    } catch (err) {
      console.error("Dashboard load error", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Calculate brand distribution from products
  const calculateBrandDistribution = (products) => {
    const brandCounts = {};
    
    products.forEach(product => {
      const brand = product.brand || 'Unknown';
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    return Object.entries(brandCounts).map(([name, value]) => ({
      name,
      value,
      revenue: Math.floor(Math.random() * 100000) + 50000 // Mock revenue for now
    })).sort((a, b) => b.value - a.value);
  };

  // Calculate sales trend from orders
  const calculateSalesTrend = (orders, range) => {
    const now = new Date();
    let days = 7;
    
    switch(range) {
      case 'week': days = 7; break;
      case 'month': days = 30; break;
      case 'quarter': days = 90; break;
      default: days = 7;
    }

    const result = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });

      const dailySales = dayOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
      const dailyOrders = dayOrders.length;

      let label;
      if (range === 'week') {
        label = dayNames[date.getDay()];
      } else if (range === 'month') {
        label = `${date.getDate()} ${monthNames[date.getMonth()].substring(0, 3)}`;
      } else {
        label = `${date.getDate()}/${date.getMonth() + 1}`;
      }

      result.push({
        date: label,
        sales: dailySales,
        orders: dailyOrders
      });
    }

    return result;
  };

  // Calculate revenue data
  const calculateRevenueData = (orders) => {
    const monthlyData = {};
    
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          revenue: 0,
          target: Math.floor(Math.random() * 50000) + 50000
        };
      }
      
      monthlyData[monthKey].revenue += parseFloat(order.total_price || 0);
    });

    return Object.values(monthlyData).slice(-6); // Last 6 months
  };

  // Calculate top selling products
  const calculateTopProducts = (orders, products) => {
    const productSales = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        const productId = item.product?.id || item.product_id;
        const product = products.find(p => p.id === productId);
        
        if (product) {
          if (!productSales[productId]) {
            productSales[productId] = {
              id: productId,
              name: product.name,
              sales: 0,
              revenue: 0
            };
          }
          
          productSales[productId].sales += item.quantity;
          productSales[productId].revenue += item.quantity * item.price;
        }
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Reset filters
  const resetFilters = () => {
    setDateRange([null, null]);
    setTimeRange("week");
  };

  // Export dashboard data
  const exportData = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Users', stats.users],
      ['Total Orders', stats.orders],
      ['Total Products', stats.products],
      ['Total Revenue', `₹${stats.revenue}`],
      ['Pending Orders', stats.pendingOrders],
      ['Low Stock Products', stats.lowStockProducts],
      ['Conversion Rate', `${stats.conversionRate}%`],
      ['Average Order Value', `₹${stats.avgOrderValue}`],
      [],
      ['Date', 'Sales', 'Orders'],
      ...salesTrend.map(row => [row.date, row.sales, row.orders]),
      [],
      ['Brand', 'Products', 'Revenue'],
      ...brandData.map(row => [row.name, row.value, row.revenue])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Dashboard data exported successfully');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-400 text-lg font-light">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-[1920px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-serif tracking-tight">
              Horologie Admin Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Luxury Timepiece Analytics & Insights
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all border border-gray-700"
            >
              <Filter size={18} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <button
              onClick={exportData}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all border border-gray-700"
            >
              <Download size={18} />
              Export
            </button>
            
            <button
              onClick={fetchDashboardData}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/20"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            
            <button
              onClick={logout}
              className="bg-gray-800 hover:bg-red-900/30 text-red-400 font-medium py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all border border-red-900/30"
            >
              <Shield size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  placeholderText="Select custom date range"
                  className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white placeholder-gray-500"
                />
              </div>

              <div>
                <select
                  value={timeRange}
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white"
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 90 Days</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={resetFilters}
                  className="text-gray-400 hover:text-white text-sm flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/manageusers"
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Manage Clients</h3>
                <p className="text-sm text-gray-400">User management & permissions</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-yellow-500 transition-colors" />
            </div>
          </Link>

          <Link
            to="/manageorders"
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Manage Orders</h3>
                <p className="text-sm text-gray-400">Order processing & tracking</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
            </div>
          </Link>

          <Link
            to="/manageproducts"
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                <Package className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Manage Collection</h3>
                <p className="text-sm text-gray-400">Product inventory & catalog</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-500 transition-colors" />
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">₹{stats.revenue.toLocaleString()}</p>
              </div>
              <DollarSign className="text-yellow-500 w-8 h-8" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-2" />
              <span className="text-emerald-400">+18% from last month</span>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Clients</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.users.toLocaleString()}</p>
              </div>
              <Users className="text-purple-500 w-8 h-8" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-2" />
              <span className="text-emerald-400">+12% from last month</span>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.orders.toLocaleString()}</p>
              </div>
              <ShoppingBag className="text-blue-500 w-8 h-8" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 text-amber-500 mr-2" />
                <span className="text-amber-400">{stats.pendingOrders} pending</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Timepieces</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.products.toLocaleString()}</p>
              </div>
              <Package className="text-emerald-500 w-8 h-8" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <AlertCircle className="w-4 h-4 text-rose-500 mr-2" />
                <span className="text-rose-400">{stats.lowStockProducts} low stock</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend Chart */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-white">Sales Trend</h3>
                <p className="text-sm text-gray-400">Revenue over {timeRange === 'week' ? '7 days' : timeRange === 'month' ? '30 days' : '90 days'}</p>
              </div>
              <div className="flex items-center gap-2">
                {['week', 'month', 'quarter'].map((range) => (
                  <button
                    key={range}
                    onClick={() => handleTimeRangeChange(range)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      timeRange === range
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {range === 'week' ? '7D' : range === 'month' ? '30D' : '90D'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#374151',
                      borderRadius: '0.5rem',
                    }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#D4AF37"
                    fill="url(#colorSales)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Brand Distribution Chart */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-white">Brand Distribution</h3>
                <p className="text-sm text-gray-400">Based on {stats.products} timepieces</p>
              </div>
              <div className="text-sm text-gray-400">
                {brandData.length} brands
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={brandData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {brandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#374151',
                      borderRadius: '0.5rem',
                    }}
                    formatter={(value, name, props) => [
                      `${props.payload.name}: ${value} products`,
                      'Count'
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-white">Top Selling Timepieces</h3>
                <p className="text-sm text-gray-400">By revenue generated</p>
              </div>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-600/20 to-yellow-400/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-yellow-500">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[200px]">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400">{product.sales} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-500">₹{product.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-white">Recent Orders</h3>
                <p className="text-sm text-gray-400">Latest transactions</p>
              </div>
              <Link to="/manageorders" className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">Order #{order.id}</p>
                    <p className="text-xs text-gray-400">{order.full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">₹{Number(order.total_price).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;