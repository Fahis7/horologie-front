import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
// Make sure this path points to your actual AuthProvider file
import { AuthContext } from "../common/context/Authprovider"; 

const AdminRoute = () => {
  const { user, loading } = useContext(AuthContext);

  // 1. Wait for Auth to finish loading (Prevents kicking you out while refreshing)
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white">
        Loading Vault...
      </div>
    );
  }

  // 2. Check if user is logged in AND is an admin
  // We check 'is_staff' or 'is_superuser' because that is what Django sends.
  if (user && (user.is_staff || user.is_superuser)) {
    return <Outlet />;
  }

  // 3. If not an admin, send them back to home
  return <Navigate to="/" replace />;
};

export default AdminRoute;