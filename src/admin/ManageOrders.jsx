import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/Api";
import { toast } from "react-hot-toast";
import {
  Filter,
  Search,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  Mail,
  BarChart3,
  DollarSign,
  User,
  ArrowLeft,
  CreditCard,
  MapPin,
  Phone,
  Watch
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ManageOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [orderNotes, setOrderNotes] = useState("");

  // Statistics
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/orders/admin/all/");
      const allOrders = res.data;
      setOrders(allOrders);
      calculateStats(allOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Calculate Statistics
  const calculateStats = (allOrders) => {
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => {
      return sum + parseFloat(order.total_price || 0);
    }, 0);

    const statusCounts = allOrders.reduce((acc, order) => {
      const status = order.status?.toLowerCase() || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    setStats({
      totalOrders,
      totalRevenue,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      pendingOrders: statusCounts.pending || 0,
      processingOrders: statusCounts.processing || 0,
      shippedOrders: statusCounts.shipped || 0,
      deliveredOrders: statusCounts.delivered || 0,
      cancelledOrders: statusCounts.cancelled || 0,
    });
  };

  // Update Order Status
  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    // ✅ Client-side check to prevent requests on locked orders
    if (['delivered', 'cancelled'].includes(selectedOrder.status?.toLowerCase())) {
        toast.error(`Order is ${selectedOrder.status} and cannot be modified.`);
        return;
    }

    try {
      await API.patch(`/orders/admin/update/${selectedOrder.id}/`, {
        status: status,
        notes: orderNotes || undefined,
      });

      toast.success(`Order #${selectedOrder.id} updated to ${status}`);
      fetchOrders();
      setSelectedOrder(null);
      setOrderNotes("");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  // Send Notification
  const sendNotification = async (orderId, notificationType) => {
    try {
      await API.post(`/orders/${orderId}/notify/`, {
        type: notificationType,
      });
      toast.success(`Notification sent for Order #${orderId}`);
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    }
  };

  // Export Orders
  const exportOrders = () => {
    const csvContent = [
      ['Order ID', 'Customer', 'Email', 'Login Method', 'Date', 'Status', 'Total', 'Items', 'Shipping Address'],
      ...filteredOrders.map(order => [
        order.id,
        order.full_name || 'Unknown',
        order.email || 'N/A',
        order.login_method || 'Email',
        new Date(order.created_at).toLocaleDateString(),
        order.status,
        `₹${Number(order.total_price).toLocaleString()}`,
        order.items.length,
        order.shipping_address?.substring(0, 50) || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Orders exported successfully');
  };

  // Get Status Style
  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "pending": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "processing": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "shipped": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "delivered": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "cancelled": return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default: return "bg-gray-800 text-gray-300 border-gray-700";
    }
  };

  // Get Status Icon
  const getStatusIcon = (status) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "processing": return <Package className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Get Login Method Badge
  const getLoginMethodBadge = (method) => {
    const m = method?.toLowerCase() || "email";
    switch (m) {
      case "google": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "facebook": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "github": return "bg-gray-800 text-gray-300 border-gray-700";
      case "email": return "bg-gray-700/50 text-gray-300 border-gray-600";
      default: return "bg-gray-800 text-gray-300 border-gray-700";
    }
  };

  // Handle back button click
  const handleBack = () => {
    navigate(-1); 
  };

  // Filter & Sort Logic
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (filterStatus !== "all" && order.status?.toLowerCase() !== filterStatus.toLowerCase()) {
          return false;
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matches =
            String(order.id).includes(query) ||
            (order.full_name?.toLowerCase() || '').includes(query) ||
            (order.email?.toLowerCase() || '').includes(query) ||
            (order.shipping_address?.toLowerCase() || '').includes(query) ||
            (order.items?.some(item => 
              item.product_name?.toLowerCase().includes(query) ||
              item.product?.name?.toLowerCase().includes(query)
            ) || false);
          if (!matches) return false;
        }

        if (startDate && endDate) {
          const orderDate = new Date(order.created_at);
          if (orderDate < startDate || orderDate > endDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "newest") return new Date(b.created_at) - new Date(a.created_at);
        if (sortOption === "oldest") return new Date(a.created_at) - new Date(b.created_at);
        if (sortOption === "totalHigh") return parseFloat(b.total_price || 0) - parseFloat(a.total_price || 0);
        if (sortOption === "totalLow") return parseFloat(a.total_price || 0) - parseFloat(b.total_price || 0);
        return 0;
      });
  }, [orders, filterStatus, searchQuery, sortOption, startDate, endDate]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset Filters
  const resetFilters = () => {
    setFilterStatus("all");
    setSearchQuery("");
    setDateRange([null, null]);
    setSortOption("newest");
    setCurrentPage(1);
  };

  // ✅ Helper to check if order is locked
  const isOrderLocked = (orderStatus) => {
      const s = orderStatus?.toLowerCase();
      return s === 'delivered' || s === 'cancelled';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-400 text-lg font-light">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-[1920px] mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-serif tracking-tight">
              Order Management
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              {stats.totalOrders} orders • ₹{stats.totalRevenue.toLocaleString()} total revenue
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
              onClick={exportOrders}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all border border-gray-700"
            >
              <Download size={18} />
              Export
            </button>
            
            <button
              onClick={fetchOrders}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/20"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalOrders}</p>
              </div>
              <BarChart3 className="text-yellow-500 w-8 h-8" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-400">
                ₹{stats.avgOrderValue.toLocaleString()} avg. value
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="text-emerald-500 w-8 h-8" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-400">
                Lifetime revenue
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-amber-700/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pendingOrders}</p>
              </div>
              <Clock className="text-amber-500 w-8 h-8" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-amber-400">
                Needs attention
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Processing</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{stats.processingOrders}</p>
              </div>
              <Package className="text-blue-500 w-8 h-8" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-blue-400">
                In fulfillment
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Delivered</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.deliveredOrders}</p>
              </div>
              <CheckCircle className="text-emerald-500 w-8 h-8" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-emerald-400">
                Completed orders
              </p>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mb-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders, customers, or watch names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white placeholder-gray-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  placeholderText="Select date range"
                  className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white placeholder-gray-500"
                />
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="totalHigh">Price: High to Low</option>
                  <option value="totalLow">Price: Low to High</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="text-gray-400 hover:text-white text-sm flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-900/80 border-b border-gray-700">
                <tr className="text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer Details</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Watch Items</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-700/20 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="font-mono text-sm text-gray-300">
                          #{order.id}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <p className="font-medium text-white truncate max-w-[150px]">
                              {order.full_name || 'Unknown Customer'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            
                            {order.login_method && (
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-3 h-3 text-gray-500" />
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getLoginMethodBadge(order.login_method)}`}>
                                  {order.login_method}
                                </span>
                              </div>
                            )}
                            
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-300">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-300 flex items-center gap-2">
                            <Watch className="w-3 h-3 text-yellow-500" />
                            <span>{order.items?.length || 0} watch{order.items?.length !== 1 ? 'es' : ''}</span>
                          </div>
                          <div className="text-xs text-gray-400 max-w-[200px]">
                            {order.items?.slice(0, 2).map((item, index) => (
                              <div key={item.id} className="truncate">
                                • {item.product_name || item.product?.name}
                                {index === 0 && order.items.length > 2 && (
                                  <span className="text-gray-500"> +{order.items.length - 2} more</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-yellow-500 font-medium">
                        ₹{Number(order.total_price || 0).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className={`text-xs px-3 py-1 rounded-full border ${getStatusStyle(order.status)}`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setStatus(order.status);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => sendNotification(order.id, 'shipping')}
                            className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Send Shipping Update"
                          >
                            <Truck size={18} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
                          <p className="text-gray-400 mb-4">Try adjusting your filters or check back later</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="border-t border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-gray-900 border border-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-yellow-500 transition-all text-white"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUp className="w-5 h-5 rotate-90" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[40px] h-10 rounded-lg border transition-colors ${
                        currentPage === pageNum
                          ? 'bg-yellow-500 border-yellow-500 text-black'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-serif text-white mb-2">Order #{selectedOrder.id}</h3>
                <p className="text-gray-400">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
                {/* ✅ VISUAL INDICATOR IF LOCKED */}
                {isOrderLocked(selectedOrder.status) && (
                    <span className="inline-block mt-2 px-3 py-1 bg-red-900/30 border border-red-800 text-red-300 text-xs rounded-full">
                        This order is {selectedOrder.status} and cannot be modified.
                    </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setOrderNotes("");
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Customer Info */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm uppercase text-gray-500 tracking-widest mb-4">Customer Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="text-gray-500 w-5 h-5 mt-1" />
                      <div>
                        <p className="text-white font-medium">{selectedOrder.full_name}</p>
                        <p className="text-gray-400 text-sm">{selectedOrder.email}</p>
                        {selectedOrder.login_method && (
                          <div className="mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full border ${getLoginMethodBadge(selectedOrder.login_method)}`}>
                              Login: {selectedOrder.login_method}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="text-gray-500 w-4 h-4" />
                        <p className="text-gray-400 text-sm">Shipping Address</p>
                      </div>
                      <p className="text-white">{selectedOrder.shipping_address || 'No address provided'}</p>
                    </div>
                    
                    {selectedOrder.phone && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="text-gray-500 w-4 h-4" />
                          <p className="text-gray-400 text-sm">Phone Number</p>
                        </div>
                        <p className="text-white">{selectedOrder.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Notes */}
                <div>
                  <h4 className="text-sm uppercase text-gray-500 tracking-widest mb-4">Order Notes</h4>
                  <textarea
                    placeholder="Add notes about this order..."
                    className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-all"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Order Status & Items */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm uppercase text-gray-500 tracking-widest mb-4">Order Status</h4>
                  {/* ✅ DISABLE SELECT IF LOCKED */}
                  <select
                    className={`w-full p-3 border border-gray-600 rounded-lg bg-gray-900 text-white mb-4 focus:border-yellow-500 outline-none appearance-none ${isOrderLocked(selectedOrder.status) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isOrderLocked(selectedOrder.status)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <h4 className="text-sm uppercase text-gray-500 tracking-widest mb-4">Watch Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center overflow-hidden">
                            {item.product?.image ? (
                              <img 
                                src={item.product.image} 
                                alt={item.product_name} 
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <Watch className="w-6 h-6 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{item.product_name || item.product?.name}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>Qty: {item.quantity}</span>
                              <span>₹{Number(item.price).toLocaleString()} each</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-yellow-500 font-medium">
                          ₹{Number(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                      <span className="text-white font-medium">Total Amount</span>
                      <span className="text-2xl font-serif text-yellow-500">
                        ₹{Number(selectedOrder.total_price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-end pt-6 border-t border-gray-700">
              <button
                onClick={() => sendNotification(selectedOrder.id, 'shipping')}
                className="px-6 py-3 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Truck size={16} />
                Shipping Update
              </button>
              <button
                onClick={() => sendNotification(selectedOrder.id, 'confirmation')}
                className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
              >
                <Mail size={16} />
                Send Confirmation
              </button>
              {/* ✅ DISABLE UPDATE BUTTON IF LOCKED */}
              <button
                onClick={handleUpdateStatus}
                disabled={isOrderLocked(selectedOrder.status)}
                className={`px-6 py-3 bg-yellow-600 text-black text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${isOrderLocked(selectedOrder.status) ? 'opacity-50 cursor-not-allowed hover:bg-yellow-600' : 'hover:bg-yellow-500'}`}
              >
                <CheckCircle size={16} />
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;