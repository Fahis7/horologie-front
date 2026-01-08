import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { FaRegHeart, FaTimes, FaBars } from "react-icons/fa";
import {
  BsBoxArrowRight,
  BsPerson,
  BsPersonCircle,
  BsClockHistory,
} from "react-icons/bs";
import { AuthContext } from "../common/context/Authprovider";

function Navbar() {
  const { logout, user } = useContext(AuthContext);
  
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // ==========================================
  // 1. CALCULATE COUNTS (DYNAMIC)
  // ==========================================
  
  // Cart: Sum of all quantities
  const cartCount = user?.cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Wishlist: Total number of items in the list
  const wishlistCount = user?.wishlist?.length || 0;

  // Display Name Logic
  const displayName = user?.first_name || user?.name || user?.email?.split('@')[0] || "User";

  // Scroll & Menu State
  const isScrollEffectPage = location.pathname === "/" || location.pathname === "/products";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (isMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Scroll Effect
  useEffect(() => {
    if (!isScrollEffectPage) {
      setIsScrolled(false);
      return;
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrollEffectPage]);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  if (isAuthPage) return null;

  // Styling
  const navbarClasses = isScrollEffectPage
    ? `fixed w-full top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-sm border-gray-100 py-4 shadow-sm"
          : "bg-transparent py-6"
      }`
    : "fixed w-full top-0 z-50 bg-white py-4 shadow-sm";

  const iconColor = isScrollEffectPage
    ? isScrolled
      ? "text-black"
      : "text-white"
    : "text-black";

  const linkStyle = `text-sm uppercase tracking-wider transition duration-300 font-light ${iconColor} hover:text-yellow-600`;

  return (
    <nav className={navbarClasses}>
      <div className="flex justify-between items-center px-6 lg:px-12 relative">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`lg:hidden ${iconColor}`}
        >
          {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
        </button>

        {/* Logo */}
        <Link
          to="/"
          className={`text-2xl lg:text-3xl font-serif italic tracking-wider lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 ${iconColor}`}
        >
          HOROLOGIE
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex items-center space-x-8">
          <li>
            <Link to="/products" className={linkStyle}>
              Collections
            </Link>
          </li>
        </ul>

        {/* Desktop Icons */}
        <ul className="flex items-center space-x-4 lg:space-x-6">
          
          {/* ========================================== */}
          {/* 2. WISHLIST ICON WITH DYNAMIC COUNT        */}
          {/* ========================================== */}
          <li className="relative hidden lg:block">
            <Link to="/wishlist">
              <FaRegHeart className={`text-lg ${iconColor}`} />
              
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] rounded-full px-1.5 min-w-[16px] h-[16px] flex items-center justify-center font-bold shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </li>

          {/* ========================================== */}
          {/* 3. CART ICON WITH DYNAMIC COUNT            */}
          {/* ========================================== */}
          <li className="relative hidden lg:block">
            <Link to="/cart">
              <HiOutlineShoppingCart className={`text-xl ${iconColor}`} />
              
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] rounded-full px-1.5 min-w-[16px] h-[16px] flex items-center justify-center font-bold shadow-sm border border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </li>

          {/* User Dropdown */}
          <li className="relative hidden lg:block" ref={dropdownRef}>
            {user ? (
              <>
                <div
                  onClick={toggleDropdown}
                  className={`text-base font-light cursor-pointer select-none ${iconColor}`}
                >
                  {displayName}
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
                    <Link
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 w-full text-sm text-gray-700 font-light hover:bg-gray-50 transition-colors"
                    >
                      <BsClockHistory className="w-4 h-4" />
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-3 w-full text-sm text-red-600 font-light hover:bg-red-50 transition-colors text-left"
                    >
                      <BsBoxArrowRight className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login">
                <BsPerson className={`text-2xl ${iconColor}`} />
              </Link>
            )}
          </li>
        </ul>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden fixed top-[72px] inset-x-0 z-40 p-6 space-y-4 bg-white text-black border-t shadow-lg"
        >
          <Link
            to="/products"
            onClick={() => setIsMenuOpen(false)}
            className="block border-b pb-3 uppercase text-sm tracking-wider"
          >
            Collections
          </Link>

          {user && (
            <Link
              to="/orders"
              onClick={() => setIsMenuOpen(false)}
              className="block border-b pb-3 uppercase text-sm tracking-wider flex items-center gap-2"
            >
              <BsClockHistory />
              My Orders
            </Link>
          )}

          {/* Mobile Wishlist Link with Count */}
          <Link
            to="/wishlist"
            onClick={() => setIsMenuOpen(false)}
            className="block border-b pb-3 uppercase text-sm tracking-wider flex items-center gap-2"
          >
            <FaRegHeart />
            Wishlist ({wishlistCount})
          </Link>

          {/* Mobile Cart Link with Count */}
          <Link
            to="/cart"
            onClick={() => setIsMenuOpen(false)}
            className="block border-b pb-3 uppercase text-sm tracking-wider flex items-center gap-2"
          >
            <HiOutlineShoppingCart />
            Cart ({cartCount})
          </Link>

          {user ? (
            <>
              <div className="text-sm pt-2 text-gray-500">
                Logged in as: <strong>{displayName}</strong>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 pt-3 text-sm uppercase cursor-pointer text-red-600 font-semibold"
              >
                <BsBoxArrowRight />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block pt-3 text-sm uppercase flex items-center gap-2"
            >
              <BsPersonCircle />
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;