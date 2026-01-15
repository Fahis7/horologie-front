import React, { createContext, useState, useEffect } from "react";
import API from "../../../api/Api";
import { toast } from "react-hot-toast";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛠️ CONFIG: API Endpoints
  const URLS = {
    PROFILE: "/auth/profile/",
    CART: "/cart/",
    WISHLIST: "/wishlist/",
    LOGOUT: "/auth/logout/",
  };

  // ============================
  // 1. Load User + Cart + Wishlist on Refresh
  // ============================
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // ✅ Run all 3 requests in parallel
        const [userRes, cartRes, wishlistRes] = await Promise.all([
          API.get(URLS.PROFILE),
          API.get(URLS.CART),
          API.get(URLS.WISHLIST),
        ]);

        setUser({
          ...userRes.data,           // User details from Django
          cart: cartRes.data.items || [], 
          wishlist: wishlistRes.data || [], 
        });

      } catch (error) {
        console.error("Auth load failed - Token likely expired", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ============================
  // 2. Login (UPDATED WITH FIX)
  // ============================
  const login = async (data) => {
    // 'data' contains { access, refresh, user: {...} }
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);

    // 🚨 THE FIX: Set User State IMMEDIATELY 🚨
    // This allows the AdminRoute to see the user (and is_staff) instantly
    // before the async cart fetch finishes.
    setUser({
      ...data.user, 
      cart: [],       // Placeholder
      wishlist: [],   // Placeholder
    });

    // ⏳ Background Fetch: Load Cart & Wishlist
    try {
      let cartItems = [];
      let wishlistItems = [];

      try {
        const [cartRes, wishlistRes] = await Promise.all([
          API.get(URLS.CART),
          API.get(URLS.WISHLIST)
        ]);
        
        cartItems = cartRes.data.items || [];
        wishlistItems = wishlistRes.data || [];
      } catch (err) {
        console.warn("Could not load secondary data", err);
      }

      // Update state again with the full data (Functional update is safer)
      setUser((prevUser) => ({
        ...prevUser, 
        cart: cartItems,
        wishlist: wishlistItems,
      }));
      
    } catch (error) {
      console.error("Login Error", error);
      // We don't show an error toast here because the user is already logged in successfully
    }
  };

  // ============================
  // 3. Logout
  // ============================
  const logout = async () => {
    const refresh = localStorage.getItem("refreshToken");
    
    // Clear state immediately for better UI response
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    if (refresh) {
      try {
        await API.post(URLS.LOGOUT, { refresh });
      } catch (error) {
        console.log("Logout backend notification failed", error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
      }}
    >
      {!loading && children} 
    </AuthContext.Provider>
  );
}