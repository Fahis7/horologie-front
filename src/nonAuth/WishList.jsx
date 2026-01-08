import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../common/context/Authprovider";
import API from "../../api/Api";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "react-hot-toast";

const Wishlist = () => {
  const { user, setUser, loading: authLoading } = useContext(AuthContext);
  const [wishlistData, setWishlistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // To prevent double clicks
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1. Fetch Wishlist Data
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else if (!authLoading) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const fetchWishlist = async () => {
    try {
      const res = await API.get("/wishlist/");
      setWishlistData(res.data);
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
      toast.error("Could not load wishlist");
    } finally {
      setLoading(false);
    }
  };

  // 2. Remove Item Only
  const handleRemove = async (productId) => {
    try {
      await API.delete(`/wishlist/remove/${productId}/`);
      
      // Update Local State
      const updatedList = wishlistData.filter((item) => item.product.id !== productId);
      setWishlistData(updatedList);
      
      // Update Global Context
      if (user) {
        const newUserWishlist = (user.wishlist || []).filter(item => item.product.id !== productId);
        setUser({ ...user, wishlist: newUserWishlist });
      }

      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing:", error);
      toast.error("Failed to remove item");
    }
  };

  // 3. ✨ Move to Cart Function
  const handleMoveToCart = async (product) => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      // Step A: Add to Cart
      const cartRes = await API.post("/cart/add/", {
        product_id: product.id,
        quantity: 1,
      });

      // Step B: Remove from Wishlist
      await API.delete(`/wishlist/remove/${product.id}/`);

      // Step C: Update UI (Local & Global)
      
      // 1. Remove from local wishlist view
      const updatedList = wishlistData.filter((item) => item.product.id !== product.id);
      setWishlistData(updatedList);

      // 2. Update Global Context (Updates Navbar Cart & Wishlist counts instantly)
      const newUserWishlist = (user.wishlist || []).filter(item => item.product.id !== product.id);
      
      setUser({
        ...user,
        cart: cartRes.data.items, // Backend returns updated cart list
        wishlist: newUserWishlist
      });

      toast.success("Moved to Cart");

    } catch (error) {
      console.error("Move to cart failed:", error);
      // Handle Stock Error specifically if your backend sends 400
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail || "Cannot add to cart");
      } else {
        toast.error("Failed to move to cart");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-3xl font-serif text-gray-900 mb-4 tracking-tight">
          Your Wishlist
        </h1>
        <div className="w-24 h-px bg-gray-300 mx-auto mb-6"></div>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Horological aspirations, meticulously preserved.
        </p>
      </div>

      {!wishlistData || wishlistData.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="mb-8 bg-gray-50 p-6 rounded-full">
            <Heart className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-serif text-gray-900 mb-4">
            No Wishlist Items
          </h2>
          <p className="text-gray-500 mb-8 max-w-md">
            Begin building your collection of exceptional timepieces
          </p>
          <Link
            to="/products"
            className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition"
          >
            Explore Watches
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistData.map((item) => (
              <div
                key={item.id}
                className="relative group rounded-lg p-4 hover:shadow-lg transition overflow-hidden border border-transparent hover:border-gray-100 flex flex-col"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.product.id)}
                  className="absolute top-4 right-4 p-2 z-10 bg-white/80 rounded-full hover:bg-white text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={18} />
                </button>

                {/* Product Link & Image */}
                <Link to={`/product/${item.product.id}`}>
                  <div className="h-64 flex items-center justify-center overflow-hidden bg-gray-50 mb-4 relative">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="object-cover w-full h-full transition-transform duration-700 ease-in-out group-hover:scale-105"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="mt-2 text-center flex-grow">
                  <h3 className="text-lg font-serif font-medium text-gray-900 truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    {item.product.category || "Luxury Watch"}
                  </p>
                  <p className="text-lg font-serif text-gray-900 mt-2 mb-4">
                    ₹{item.product.price.toLocaleString()}
                  </p>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleMoveToCart(item.product)}
                  disabled={actionLoading}
                  className="w-full mt-auto py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2 group-hover:bg-black"
                >
                  <ShoppingBag size={14} />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-white border border-gray-300 text-gray-900 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;