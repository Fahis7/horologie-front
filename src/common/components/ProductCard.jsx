import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, ChevronRight } from "lucide-react";
import { AuthContext } from "../context/Authprovider";
import API from "../../../api/Api";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const [isWished, setIsWished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (user?.wishlist) {
      const found = user.wishlist.some(
        (item) => item.product.id === product.id
      );
      setIsWished(found);
    }
  }, [user, product.id]);

  const handleWishList = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (isWished) {
        await API.delete(`/wishlist/remove/${product.id}/`);
        setIsWished(false);
        toast.success("Removed from collection");
        const currentWishlist = user.wishlist || [];
        const newWishlist = currentWishlist.filter(
          (item) => item.product.id !== product.id
        );
        setUser({ ...user, wishlist: newWishlist });
      } else {
        const res = await API.post("/wishlist/", { product_id: product.id });
        setIsWished(true);
        toast.success("Added to collection");
        const currentWishlist = user.wishlist || [];
        const newWishlist = [...currentWishlist, res.data];
        setUser({ ...user, wishlist: newWishlist });
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not update collection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative w-full">
      <Link to={`/product/${product.id}`} className="block h-full">
        <div
          className="relative bg-white rounded-xl overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02] h-full flex flex-col"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Premium Badges */}
          {product.isNew && (
            <div className="absolute top-4 left-4 z-20">
              <span className="bg-white text-black text-[10px] font-semibold tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                NEW ARRIVAL
              </span>
            </div>
          )}

          {/* Actions Overlay */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button
              onClick={handleWishList}
              disabled={loading}
              className={`p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
                isHovered || isWished
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
              }`}
              aria-label="Add to collection"
            >
              <Heart
                className={`w-4 h-4 transition-all duration-300 ${
                  isWished
                    ? "fill-black stroke-black"
                    : "stroke-gray-700 hover:stroke-black"
                }`}
                fill={isWished ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Product Image Container - Fixed Aspect Ratio */}
          <div className="relative w-full pb-[130.33%] bg-gray-100 overflow-hidden">
            {/* Loader */}
            <div className="absolute inset-0 flex items-center justify-center">
              {!imageLoaded && (
                <div className="animate-pulse">
                  <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Actual Image */}
            <img
              src={product.image}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              } ${isHovered ? "scale-105" : "scale-100"}`}
              onLoad={() => setImageLoaded(true)}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Quick Add to Cart */}
            <button
              className={`absolute bottom-0 left-0 right-0 bg-black text-white py-3.5 text-sm font-medium tracking-widest uppercase transform transition-all duration-300 ${
                isHovered
                  ? "translate-y-0 opacity-100"
                  : "translate-y-full opacity-0"
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.success("Added to cart");
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </div>
            </button>
          </div>

          {/* Product Info */}
          <div className="p-5 flex-grow flex flex-col justify-between">
            <div>
              {/* Brand */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase">
                  {product.brand}
                </span>
                {product.rating && (
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {product.rating}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Name */}
              <h3 className="text-lg font-serif font-normal text-gray-900 leading-snug tracking-tight line-clamp-2 min-h-[3.5rem]">
                {product.name}
              </h3>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-light text-gray-900">
                  ${product.price?.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ${product.originalPrice?.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 group-hover:text-black transition-colors duration-300">
                  View details
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;