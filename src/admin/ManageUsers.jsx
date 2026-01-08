import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [blockFilter, setBlockFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    blocked: 0,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("https://horologie-live-2.onrender.com/users");
      setUsers(res.data);
      
      // Calculate statistics
      const totalUsers = res.data.length;
      const admins = res.data.filter(u => u.role === "Admin").length;
      const blocked = res.data.filter(u => u.isBlock).length;

      setStats({
        totalUsers,
        admins,
        blocked,
      });
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    
    // Set up interval for automatic refresh every 30 seconds
    const intervalId = setInterval(fetchUsers, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchUsers]);

  const toggleBlock = async (user) => {
    try {
      await axios.patch(`https://horologie-live-2.onrender.com/users/${user.id}`, {
        isBlock: !user.isBlock,
      });
      // Optimistically update the UI
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? {...u, isBlock: !u.isBlock} : u
        )
      );
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  const changeRole = async (user, newRole) => {
    try {
      await axios.patch(`https://horologie-live-2.onrender.com/users/${user.id}`, {
        role: newRole,
      });
      // Optimistically update the UI
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? {...u, role: newRole} : u
        )
      );
    } catch (err) {
      console.error("Role change failed", err);
    }
  };

  useEffect(() => {
    let temp = [...users];

    if (searchTerm)
      temp = temp.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (roleFilter !== "All")
      temp = temp.filter((u) => u.role.toLowerCase() === roleFilter.toLowerCase());

    if (blockFilter !== "All")
      temp = temp.filter((u) =>
        blockFilter === "Blocked" ? u.isBlock : !u.isBlock
      );

    setFiltered(temp);
  }, [searchTerm, roleFilter, blockFilter, users]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-400 mb-4"></div>
          <p className="text-gold-400 text-lg font-light">Loading users...</p>
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
              <h1 className="text-4xl font-bold text-white">User Management</h1>
              <p className="text-gray-400 mt-2">
                -Administer system users and permissions-
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm hover:shadow-lg hover:shadow-gold-400/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-3xl font-light text-gold-400 mt-1">
                  {stats.totalUsers}
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <p className="text-xs text-gray-400">Registered in system</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm hover:shadow-lg hover:shadow-gold-400/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Admin Users</p>
                <p className="text-3xl font-light text-gold-400 mt-1">
                  {stats.admins}
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
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <p className="text-xs text-gray-400">With admin privileges</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm hover:shadow-lg hover:shadow-gold-400/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Blocked Users</p>
                <p className="text-3xl font-light text-gold-400 mt-1">
                  {stats.blocked}
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
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <p className="text-xs text-gray-400">Currently restricted</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl shadow-sm p-6  mb-8 border border-gray-700/50 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2.5 w-full border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 text-gray-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-700 px-4 py-2.5 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 appearance-none text-gray-100 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiZxdW90O2N1cnJlbnRDb2xvciZxdW90OyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_0.75rem] bg-[length:1.5rem] backdrop-blur-sm"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
            
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="border border-gray-700 px-4 py-2.5 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 appearance-none text-gray-100 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiZxdW90O2N1cnJlbnRDb2xvciZxdW90OyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_0.75rem] bg-[length:1.5rem] backdrop-blur-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Blocked">Blocked</option>
              <option value="Unblocked">Unblocked</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl shadow border border-gray-700/50 overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800/30 divide-y divide-gray-700/50">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/20 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700/50 flex items-center justify-center border border-gray-600">
                          <span className="text-gold-400 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-100">{user.name}</div>
                          <div className="text-xs text-gray-400">Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-100">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user, e.target.value)}
                        className={`px-3 py-1 text-sm leading-5 rounded-lg border focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 bg-gray-800/50 ${
                          user.role === 'Admin' 
                            ? 'text-purple-300 border-purple-700/50' 
                            : 'text-blue-300 border-blue-700/50'
                        }`}
                      >
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        user.isBlock 
                          ? 'bg-rose-900/30 text-rose-300 border-rose-700' 
                          : 'bg-emerald-900/30 text-emerald-300 border-emerald-700'
                      }`}>
                        {user.isBlock ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => toggleBlock(user)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          user.isBlock
                            ? 'bg-gray-800 text-white hover:bg-gray-900'
                            : 'bg-gray-800 text-white hover:bg-gray-900'
                        }`}
                      >
                        {user.isBlock ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl shadow-sm p-12 text-center mt-4 border border-gray-700/50 backdrop-blur-sm">
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-light text-gray-200">No users found</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              {searchTerm || roleFilter !== "All" || blockFilter !== "All"
                ? "Try adjusting your search or filter criteria"
                : "The system currently has no users"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;