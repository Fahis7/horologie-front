import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/Api";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  User,
  UserPlus,
  Shield,
  ShieldOff,
  Mail,
  Calendar,
  MoreVertical,
  Search,
  Filter,
  X,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Ban,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Activity,
  Users,
  Lock,
  Unlock,
  Crown,
  Star
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    blocked: 0,
    newUsers: 0,
    activeUsers: 0,
    avgRegistrationDays: 0,
  });

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/accounts/admin/users/");
      const data = res.data;
      setUsers(data);
      calculateStats(data);
    } catch (err) {
      console.error("Fetch failed", err);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Calculate Statistics
  const calculateStats = (usersData) => {
    const totalUsers = usersData.length;
    const admins = usersData.filter(u => u.role === "Admin").length;
    const blocked = usersData.filter(u => u.is_blocked).length;
    
    // Users registered in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = usersData.filter(u => new Date(u.date_joined) > thirtyDaysAgo).length;
    
    // Active users (not blocked)
    const activeUsers = usersData.filter(u => !u.is_blocked).length;

    // Average days since registration
    const now = new Date();
    const totalDays = usersData.reduce((sum, user) => {
      const joinedDate = new Date(user.date_joined);
      const daysSince = Math.floor((now - joinedDate) / (1000 * 60 * 60 * 24));
      return sum + daysSince;
    }, 0);
    const avgRegistrationDays = usersData.length > 0 ? Math.round(totalDays / usersData.length) : 0;

    setStats({
      totalUsers,
      admins,
      blocked,
      newUsers,
      activeUsers,
      avgRegistrationDays,
    });
  };

  // Block / Unblock User
  const toggleBlock = async (user) => {
    try {
      const res = await API.patch(`/accounts/admin/users/${user.id}/block/`);
      const updatedUser = res.data;

      setUsers(prevUsers => 
        prevUsers.map(u => u.id === user.id ? updatedUser : u)
      );
      
      toast.success(
        updatedUser.is_blocked 
          ? `User ${user.name} has been blocked` 
          : `User ${user.name} has been activated`
      );
    } catch (err) {
      console.error("Toggle failed", err);
      toast.error(err.response?.data?.error || "Action failed");
    }
  };

  // Change Role
  const changeRole = async (user, newRole) => {
    try {
      const res = await API.patch(`/accounts/admin/users/${user.id}/role/`, {
        role: newRole,
      });
      const updatedUser = res.data;

      setUsers(prevUsers => 
        prevUsers.map(u => u.id === user.id ? updatedUser : u)
      );
      toast.success(`${user.name} role changed to ${newRole}`);
    } catch (err) {
      console.error("Role change failed", err);
      toast.error(err.response?.data?.error || "Failed to update role");
    }
  };

  // Filter & Sort Logic
  const filteredUsersMemo = useMemo(() => {
    return users
      .filter((user) => {
        if (roleFilter !== "all" && user.role !== roleFilter) {
          return false;
        }

        if (statusFilter !== "all") {
          if (statusFilter === "blocked" && !user.is_blocked) return false;
          if (statusFilter === "active" && user.is_blocked) return false;
        }

        if (searchTerm) {
          const query = searchTerm.toLowerCase();
          const matches =
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query);
          if (!matches) return false;
        }

        if (startDate && endDate) {
          const userDate = new Date(user.date_joined);
          if (userDate < startDate || userDate > endDate) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date_joined) - new Date(a.date_joined));
  }, [users, roleFilter, statusFilter, searchTerm, startDate, endDate]);

  useEffect(() => {
    setFilteredUsers(filteredUsersMemo);
  }, [filteredUsersMemo]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset Filters
  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setDateRange([null, null]);
    setCurrentPage(1);
  };

  // Export Users
  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Joined Date', 'Last Login'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.is_blocked ? 'Blocked' : 'Active',
        new Date(user.date_joined).toLocaleDateString(),
        user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Users exported successfully');
  };

  // Handle back button click
  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-400 text-lg font-light">Loading users...</p>
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
              User Management
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              {stats.totalUsers} total users • {stats.activeUsers} active • {stats.admins} administrators
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
              onClick={exportUsers}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all border border-gray-700"
            >
              <Download size={18} />
              Export
            </button>
            
            <button
              onClick={fetchUsers}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/20"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</p>
              </div>
              <Users className="text-yellow-500 w-8 h-8" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-400">
                {stats.newUsers} new in last 30 days
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Administrators</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.admins}</p>
              </div>
              <Crown className="text-purple-500 w-8 h-8" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-400">
                Manage system permissions
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-6 hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.activeUsers}</p>
              </div>
              <Activity className="text-emerald-500 w-8 h-8" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-emerald-400">
                Currently active accounts
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-rose-700/30 rounded-xl p-6 hover:border-rose-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Blocked Users</p>
                <p className="text-2xl font-bold text-rose-400 mt-1">{stats.blocked}</p>
              </div>
              <Ban className="text-rose-500 w-8 h-8" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-rose-400">
                Restricted access accounts
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
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white placeholder-gray-500"
                />
              </div>

              {/* Role Filter */}
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white"
                >
                  <option value="all">All Roles</option>
                  <option value="Admin">Administrator</option>
                  <option value="User">User</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
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
                  placeholderText="Joined date range"
                  className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white placeholder-gray-500"
                />
              </div>
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
        )}

        {/* Users Table */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-900/80 border-b border-gray-700">
                <tr className="text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">User Profile</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Joined Date</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-700/20 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-600/20 to-yellow-400/20 flex items-center justify-center border border-yellow-500/30">
                              <span className="text-xl font-bold text-yellow-500">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {user.role === "Admin" && (
                              <div className="absolute -top-1 -right-1">
                                <Crown className="w-4 h-4 text-purple-500 fill-purple-500" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate max-w-[150px]">
                              {user.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              <p className="text-xs text-gray-500">
                                Member for {Math.floor((new Date() - new Date(user.date_joined)) / (1000 * 60 * 60 * 24))} days
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <p className="text-sm text-gray-300 truncate max-w-[200px]">
                            {user.email}
                          </p>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm text-gray-300">
                          {new Date(user.date_joined).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(user.date_joined).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => changeRole(user, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border bg-gray-900 outline-none cursor-pointer transition-colors ${
                            user.role === 'Admin' 
                              ? 'text-purple-400 border-purple-500/50 hover:border-purple-400' 
                              : 'text-blue-400 border-blue-500/50 hover:border-blue-400'
                          }`}
                        >
                          <option value="Admin" className="bg-gray-900">Admin</option>
                          <option value="User" className="bg-gray-900">User</option>
                        </select>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {user.is_blocked ? (
                            <Ban className="w-4 h-4 text-rose-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          )}
                          <span className={`text-xs px-3 py-1.5 rounded-full border ${
                            user.is_blocked 
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {user.is_blocked ? 'Blocked' : 'Active'}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => toggleBlock(user)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.is_blocked
                                ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                                : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
                            }`}
                            title={user.is_blocked ? 'Unblock User' : 'Block User'}
                          >
                            {user.is_blocked ? <Unlock size={18} /> : <Lock size={18} />}
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
                    <td colSpan="6" className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
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
          {filteredUsers.length > 0 && (
            <div className="border-t border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
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

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-gray-700">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-serif text-white mb-2">{selectedUser.name}</h3>
                <p className="text-gray-400">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm uppercase text-gray-500 tracking-widest mb-4">User Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-gray-500 w-4 h-4" />
                      <div>
                        <p className="text-gray-400 text-xs">Joined Date</p>
                        <p className="text-white">
                          {new Date(selectedUser.date_joined).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedUser.is_blocked ? (
                        <Ban className="text-rose-500 w-4 h-4" />
                      ) : (
                        <CheckCircle className="text-emerald-500 w-4 h-4" />
                      )}
                      <div>
                        <p className="text-gray-400 text-xs">Status</p>
                        <p className={`font-medium ${
                          selectedUser.is_blocked ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {selectedUser.is_blocked ? 'Blocked' : 'Active'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm uppercase text-gray-500 tracking-widest mb-4">Actions</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        toggleBlock(selectedUser);
                        setSelectedUser(null);
                      }}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedUser.is_blocked
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-rose-600 hover:bg-rose-500 text-white'
                      }`}
                    >
                      {selectedUser.is_blocked ? 'Unblock User' : 'Block User'}
                    </button>
                    
                    <select
                      value={selectedUser.role}
                      onChange={(e) => {
                        changeRole(selectedUser, e.target.value);
                        setSelectedUser(null);
                      }}
                      className="w-full p-2.5 border border-gray-600 rounded-lg bg-gray-900 text-white focus:border-yellow-500 outline-none"
                    >
                      <option value="User">Set as User</option>
                      <option value="Admin">Set as Administrator</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-700 flex justify-end gap-4">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-2.5 text-gray-400 hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Add more actions here
                    setSelectedUser(null);
                  }}
                  className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-black text-sm font-bold rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;