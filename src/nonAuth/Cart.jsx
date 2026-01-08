import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import { AuthContext } from "../common/context/Authprovider";
import API from "../../api/Api";
import { toast } from "react-hot-toast";

function Cart() {
  const { user, setUser, loading: userLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (!user && !userLoading) {
      navigate("/login");
    }
  }, [user, userLoading, navigate]);

  // 🛒 Fetch cart on mount
  useEffect(() => {
    if (!user) return;
    fetchCart();
  }, [user?.id]);

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart/");
      updateUserCart(res.data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      toast.error("Failed to load your cart");
    } finally {
      setLoading(false);
    }
  };

  const updateUserCart = (cartData) => {
    setUser((prev) => ({
      ...prev,
      cart: cartData.items || [],
      cartTotal: cartData.total_price || 0,
    }));
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setActionLoading(true);
      const res = await API.patch(`/cart/update/${itemId}/`, {
        quantity: newQuantity,
      });
      updateUserCart(res.data);
      toast.success("Cart updated");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to update quantity");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      setActionLoading(true);
      const res = await API.delete(`/cart/remove/${itemId}/`);
      updateUserCart(res.data);
      toast.success("Item removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item");
    } finally {
      setActionLoading(false);
    }
  };

  const totalItems = user?.cart?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const totalPrice =
    user?.cart?.reduce((sum, i) => sum + i.product.price * i.quantity, 0) || 0;

  // ⏳ Loading State
  if (loading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
          <p className="text-gray-400 font-light tracking-widest uppercase text-xs">
            Loading Cart...
          </p>
        </div>
      </div>
    );
  }

  // 🛍 Empty Cart State
  if (!user?.cart || user.cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <h2 className="text-4xl font-serif italic mb-6">
            Your Cart is Empty
          </h2>
          <p className="text-gray-500 mb-8 font-light leading-relaxed">
            It looks like you haven't discovered our collection yet. Explore our
            timepieces to find your perfect match.
          </p>
          <Link
            to="/products"
            className="inline-block px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors duration-300"
          >
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center border-b border-gray-100 pb-8 mb-12">
          <h1 className="text-3xl md:text-2xl font-serif italic text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-500 text-xs font-light uppercase tracking-widest">
            {totalItems} {totalItems === 1 ? "Item" : "Items"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left Column: Cart Items */}
          <div className="flex-1 space-y-8">
            {user.cart.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row gap-6 pb-8 border-b border-gray-100 last:border-0"
              >
                {/* Image */}
                <div className="w-full sm:w-32 h-40 bg-gray-50 overflow-hidden relative">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Info & Controls */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 font-serif">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                        {item.product.category || "Luxury Watch"}
                      </p>
                    </div>
                    <p className="text-lg font-medium font-serif">
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex justify-between items-end mt-6">
                    {/* Quantity Control */}
                    <div className="flex items-center border border-gray-200">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        disabled={actionLoading || item.quantity <= 1}
                        className="p-3 text-gray-500 hover:text-black hover:bg-gray-50 disabled:opacity-30 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        disabled={actionLoading}
                        className="p-3 text-gray-500 hover:text-black hover:bg-gray-50 disabled:opacity-30 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={actionLoading}
                      className="text-xs text-gray-400 hover:text-red-500 uppercase tracking-wider font-medium flex items-center gap-2 transition-colors pb-2"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-gray-50 p-8 sticky top-28">
              <h2 className="text-lg font-serif mb-6 border-b border-gray-200 pb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm text-gray-600 font-light">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 font-light">
                  <span>Shipping Estimate</span>
                  <span className="text-green-700 font-medium">
                    calculated at next step
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 font-light">
                  <span>Tax Estimate</span>
                  <span>Included</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-8">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-medium text-gray-900">
                    Order Total
                  </span>
                  <span className="text-2xl font-serif">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate("/checkout", {
                    state: {
                      totalAmount: totalPrice,
                      cartItems: user.cart,
                    },
                  })
                }
                className="w-full bg-black text-white py-4 px-6 text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Checkout
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              <div className="mt-6 text-center">
                <Link
                  to="/products"
                  className="text-xs text-gray-500 hover:text-black uppercase tracking-wider underline underline-offset-4 decoration-gray-300 hover:decoration-black transition-all"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
