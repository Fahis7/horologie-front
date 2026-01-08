import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const ManageOrders = () => {
  const [users, setUsers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [status, setStatus] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("https://horologie-live-2.onrender.com/users");
      setUsers(res.data);

      // Calculate statistics
      const allOrders = res.data.flatMap((user) => user.orders || []);
      const totalOrders = allOrders.length;
      const totalRevenue = allOrders.reduce((sum, order) => {
        return (
          sum +
          order.items.reduce(
            (orderSum, item) => orderSum + parseFloat(item.price),
            0
          )
        );
      }, 0);

      setStats({
        totalOrders,
        totalRevenue,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateStatus = async () => {
    try {
      const updatedUsers = users.map((user) => {
        if (user.id === selectedUserId) {
          return {
            ...user,
            orders: user.orders.map((order) =>
              order.id === selectedOrder.id ? { ...order, status } : order
            ),
          };
        }
        return user;
      });

      const updatedUser = updatedUsers.find((u) => u.id === selectedUserId);
      await axios.put(
        `https://horologie-live-2.onrender.com/users/${selectedUserId}`,
        updatedUser
      );

      setUsers(updatedUsers);
      setSelectedOrder(null);
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-900/30 text-amber-300 border-amber-700";
      case "Processing":
        return "bg-blue-900/30 text-blue-300 border-blue-700";
      case "Shipped":
        return "bg-indigo-900/30 text-indigo-300 border-indigo-700";
      case "Delivered":
        return "bg-emerald-900/30 text-emerald-300 border-emerald-700";
      case "Cancelled":
        return "bg-rose-900/30 text-rose-300 border-rose-700";
      default:
        return "bg-gray-800 text-gray-300 border-gray-700";
    }
  };

  const filteredOrders = users
    .filter((user) => user.orders?.length > 0)
    .flatMap((user) =>
      user.orders
        .filter((order) =>
          filterStatus === "All" ? true : order.status === filterStatus
        )
        .filter(
          (order) =>
            searchQuery === "" ||
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((order) => ({ ...order, user }))
    )
    .sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.date) - new Date(a.date);
      } else if (sortOption === "oldest") {
        return new Date(a.date) - new Date(b.date);
      } else if (sortOption === "totalHigh") {
        const totalA = a.items.reduce(
          (sum, item) => sum + parseFloat(item.price),
          0
        );
        const totalB = b.items.reduce(
          (sum, item) => sum + parseFloat(item.price),
          0
        );
        return totalB - totalA;
      } else if (sortOption === "totalLow") {
        const totalA = a.items.reduce(
          (sum, item) => sum + parseFloat(item.price),
          0
        );
        const totalB = b.items.reduce(
          (sum, item) => sum + parseFloat(item.price),
          0
        );
        return totalA - totalB;
      }
      return 0;
    });

  const statusCounts = users
    .flatMap((user) => user.orders || [])
    .reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-400 mb-4"></div>
          <p className="text-gold-400 text-lg font-light">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white">
                Order Management
              </h1>
              <p className="text-gray-400 mt-2">
                -Premium customer order oversight-
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-end xl:items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 text-gray-100"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-700 px-4 py-2.5 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 appearance-none text-gray-100 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiZxdW90O2N1cnJlbnRDb2xvciZxdW90OyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_0.75rem] bg-[length:1.5rem] backdrop-blur-sm"
              >
                <option value="All">All Statuses</option>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <option key={status} value={status}>
                    {status} ({count})
                  </option>
                ))}
              </select>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border border-gray-700 px-4 py-2.5 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 appearance-none text-gray-100 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiZxdW90O2N1cnJlbnRDb2xvciZxdW90OyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_0.75rem] bg-[length:1.5rem] backdrop-blur-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="totalHigh">Total (High to Low)</option>
                <option value="totalLow">Total (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm hover:shadow-lg hover:shadow-gold-400/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Orders</p>
                <p className="text-3xl font-light text-gold-400 mt-1">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-700/50">
                <svg
                  className="w-6 h-6 text-gold-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <p className="text-xs text-gray-400">Across all statuses</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm hover:shadow-lg hover:shadow-gold-400/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-3xl font-light text-gold-400 mt-1">
                  ₹{stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-700/50">
                <svg
                  className="w-6 h-6 text-gold-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <p className="text-xs text-gray-400">From all orders</p>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setFilterStatus("All")}
              className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-200 ${
                filterStatus === "All"
                  ? "bg-gray-700 border-gray-600 text-gray-100 shadow-lg shadow-gray-600/10"
                  : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              <div className="w-3 h-3 rounded-full mr-2 bg-gray-600"></div>
              <span className="text-sm font-medium">
                All: <span className="font-bold">{stats.totalOrders}</span>
              </span>
            </button>

            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-200 ${
                  filterStatus === status
                    ? getStatusStyle(status) + " shadow-lg shadow-current/10"
                    : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    getStatusStyle(status).split(" ")[0]
                  }`}
                ></div>
                <span className="text-sm font-medium">
                  {status}: <span className="font-bold">{count}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl shadow-sm p-12 text-center border border-gray-700/50 backdrop-blur-sm">
            <svg
              className="mx-auto h-16 w-16 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-4 text-xl font-light text-gray-200">
              No orders found
            </h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              {filterStatus === "All"
                ? "The order archive is currently empty."
                : `No orders match the "${filterStatus}" status filter.`}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-700/50 rounded-xl p-6 bg-gradient-to-br from-gray-800/50 to-gray-800/30 hover:shadow-lg hover:shadow-gold-400/10 transition-all duration-300 backdrop-blur-sm group"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-light text-gray-100 group-hover:text-gold-400 transition-colors duration-200">
                        Order #{order.id}
                      </h3>
                      <span
                        className={`text-xs px-3 py-1.5 rounded-full border ${getStatusStyle(
                          order.status
                        )} group-hover:scale-105 transition-transform duration-200`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>{order.user.name}</span>
                      </div>
                      {order.date && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {new Date(order.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-end xl:items-center gap-4">
                    <div className="text-2xl font-light text-gold-400 group-hover:text-gold-300 transition-colors duration-200">
                      ₹
                      {order.items
                        .reduce(
                          (total, item) => total + parseFloat(item.price),
                          0
                        )
                        .toFixed(2)}
                    </div>
                    <button
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:gray-600 transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-md "
                      onClick={() => {
                        setSelectedOrder(order);
                        setSelectedUserId(order.user.id);
                        setStatus(order.status);
                      }}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>Update Status</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-700/50 pt-5">
                  <h4 className="font-medium text-gold-400 mb-4 text-sm uppercase tracking-wider">
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors duration-200"
                      >
                        <div className="w-16 h-16 rounded-lg   flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <span className="text-gold-400 font-medium">
                              {item.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-100 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-400">₹{item.price}</p>
                        </div>
                        <div className="text-sm text-gray-400 whitespace-nowrap">
                          Qty: {item.quantity || 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-800/90 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-700/50 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-gold-600">
                Update Order Status
              </h3>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setSelectedUserId(null);
                }}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-8 space-y-1">
              <p className="text-gray-400 text-sm">Order ID</p>
              <p className="font-medium text-gray-100">{selectedOrder.id}</p>

              <p className="text-gray-400 text-sm mt-3">Customer</p>
              <p className="font-medium text-gray-100">
                {users.find((u) => u.id === selectedUserId)?.name}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Current Status
                </label>
                <div
                  className={`px-4 py-3 rounded-lg border ${getStatusStyle(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Update to
                </label>
                <select
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 text-gray-100 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiZxdW90O2N1cnJlbnRDb2xvciZxdW90OyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem]"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                className="px-5 py-2.5 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium"
                onClick={() => {
                  setSelectedOrder(null);
                  setSelectedUserId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 bg-gray-700 text-white rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-gold-400/30"
                onClick={handleUpdateStatus}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
