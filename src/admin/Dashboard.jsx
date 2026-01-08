import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../common/context/Authprovider";
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
} from "recharts";

const COLORS = ["#B8860B", "#DAA520", "#CD853F", "#8B4513", "#A0522D"];
const LINE_COLORS = ["#D4AF37", "#C0C0C0", "#B87333"];

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
  });
  const [brandData, setBrandData] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, productsRes] = await Promise.all([
          axios.get("https://horologie-live-2.onrender.com/users"),
          axios.get("https://horologie-live-2.onrender.com/products"),
        ]);

        const users = usersRes.data;
        const products = productsRes.data;

        // Process orders data
        const allOrders = users.flatMap((user) => user.orders || []);

        // Process brand data for pie chart
        const brandCounts = {};
        allOrders.forEach((order) => {
          order.items.forEach((item) => {
            brandCounts[item.brand] =
              (brandCounts[item.brand] || 0) + item.quantity;
          });
        });

        // Process sales trend data (last 7 days)
        const today = new Date();
        const salesData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          const dateStr = date.toISOString().split("T")[0];

          const dailyOrders = allOrders.filter(
            (order) =>
              new Date(order.date).toISOString().split("T")[0] === dateStr
          );

          return {
            date: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            sales: dailyOrders.reduce((sum, order) => sum + order.total, 0),
          };
        });

        const brandChartData = Object.entries(brandCounts).map(
          ([name, value]) => ({
            name,
            value,
          })
        );

        setStats({
          users: users.length,
          orders: allOrders.length,
          products: products.length,
        });
        setBrandData(brandChartData);
        setSalesTrend(salesData);
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Logout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gold-400">
              Horologie Admin
            </h1>
            <p className="text-gray-400 mt-1">Luxury Timepiece Analytics</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gold-400 px-4 py-2 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                clipRule="evenodd"
              />
            </svg>
            Logout
          </button>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-[54px]">
          <Link
            to="/manageusers"
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 px-30 py-3 rounded-lg transition-colors border border-gray-700 group"
          >
            <div className="p-2 rounded-full bg-gold-400/10 group-hover:bg-gold-400/20 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gold-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            Manage Clients
          </Link>
          <Link
            to="/manageorders"
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 px-30 py-3 rounded-lg transition-colors border border-gray-700 group"
          >
            <div className="p-2 rounded-full bg-gold-400/10 group-hover:bg-gold-400/20 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gold-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            Manage Orders
          </Link>
          <Link
            to="/manageproducts"
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 px-30 py-3 rounded-lg transition-colors border border-gray-700 group"
          >
            <div className="p-2 rounded-full bg-gold-400/10 group-hover:bg-gold-400/20 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gold-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            Manage Collection
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Clients"
            value={stats.users}
            trend="+12%"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Total Orders"
            value={stats.orders}
            trend="+24%"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
          />
          <StatCard
            title="Timepieces"
            value={stats.products}
            trend="+5%"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="7-Day Sales Trend (₹)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={salesTrend}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    borderColor: "#374151",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#D4AF37"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#D4AF37" }}
                  activeDot={{ r: 6, fill: "#FBBF24" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Brand Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={brandData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {brandData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    borderColor: "#374151",
                    borderRadius: "0.5rem",
                  }}
                  itemStyle={{
                    color: "#F9FAFB", 
                  }}
                  labelStyle={{
                    color: "#FACC15", 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, icon }) => (
  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 transition-all hover:border-gold-400/30 hover:shadow-lg hover:shadow-gold-400/5">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-lg bg-gold-400/10 text-gold-400">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-gray-100">
            {value.toLocaleString()}
          </h3>
        </div>
      </div>
      {trend && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
          {trend}
        </span>
      )}
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
    <h3 className="text-lg font-semibold text-gold-400 mb-4">{title}</h3>
    {children}
  </div>
);

export default Dashboard;
