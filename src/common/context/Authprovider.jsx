import React, { createContext, useState, useEffect } from "react";
import API from "../../../api/Api";
import { toast } from "react-hot-toast";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛠️ CONFIG: Added WISHLIST endpoint
  const URLS = {
    PROFILE: "/auth/profile/",
    CART: "/cart/",
    WISHLIST: "/wishlist/", // ✅ Added this
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
          API.get(URLS.WISHLIST), // Fetch wishlist here
        ]);

        setUser({
          ...userRes.data,           // User details
          cart: cartRes.data.items || [], // Cart Items
          wishlist: wishlistRes.data || [], // ✅ Wishlist Items (Now Navbar count works!)
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
  // 2. Login
  // ============================
  const login = async (data) => {
    // 'data' contains tokens and basic user info from login response
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);

    try {
      // ✅ Fetch Cart and Wishlist in parallel
      let cartItems = [];
      let wishlistItems = [];

      try {
        const [cartRes, wishlistRes] = await Promise.all([
          API.get(URLS.CART),
          API.get(URLS.WISHLIST)
        ]);
        
        cartItems = cartRes.data.items;
        wishlistItems = wishlistRes.data;
      } catch (err) {
        console.warn("Could not load secondary data", err);
      }

      setUser({
        ...data.user, 
        cart: cartItems || [],
        wishlist: wishlistItems || [], // ✅ Set wishlist on login
      });
      
    } catch (error) {
      console.error("Login Error", error);
      toast.error("Login succeeded but failed to load data");
    }
  };

  // ============================
  // 3. Logout
  // ============================
  const logout = async () => {
    const refresh = localStorage.getItem("refreshToken");
    
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