import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../common/context/Authprovider";
import API from "../../../api/Api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  ShoppingBag, 
  Share2, 
  Play, 
  ChevronLeft, 
  ShieldCheck, 
  Truck,
  Link as LinkIcon
} from "lucide-react";

// --- HELPERS ---
const GrainOverlay = () => (
  <div
    className="absolute inset-0 pointer-events-none z-0 opacity-[0.02] mix-blend-multiply"
    style={{
      backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")`,
    }}
  />
);

// Custom Swiss Shield Icon matching Lucide style
const SwissShieldIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [fullscreenMedia, setFullscreenMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  // 🔹 1. Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}/`);
        setProduct(res.data);
        setActiveImage(res.data.image);
      } catch (error) {
        console.error("Failed to load product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 🔹 2. Check Wishlist
  useEffect(() => {
    if (user?.wishlist && product) {
      const found = user.wishlist.some((item) => item.product.id === product.id);
      setIsWished(found);
    }
  }, [user, product]);

  // 🛒 Add to cart
  const handleAddCart = async () => {
    if (!user) return navigate("/login");

    const existingItem = user.cart?.find((item) => item.product.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;

    if (currentQuantity + 1 > product.stock) {
      toast.error("Exceeds available stock.");
      return;
    }

    try {
      setUpdating(true);
      const res = await API.post("/cart/add/", { product_id: product.id, quantity: 1 });
      setUser((prev) => ({ ...prev, cart: res.data.items }));
      toast.success("Added to shopping bag.");
    } catch (error) {
      toast.error("Failed to add to cart.");
    } finally {
      setUpdating(false);
    }
  };

  // ❤️ Toggle Wishlist
  const handleToggleWishlist = async () => {
    if (!user) return navigate("/login");
    try {
      setUpdating(true);
      if (isWished) {
        await API.delete(`/wishlist/remove/${product.id}/`);
        setIsWished(false);
        const newWishlist = user.wishlist.filter(item => item.product.id !== product.id);
        setUser(prev => ({ ...prev, wishlist: newWishlist }));
        toast.success("Removed from wishlist");
      } else {
        const res = await API.post("/wishlist/", { product_id: product.id });
        setIsWished(true);
        const newWishlist = [...(user.wishlist || []), res.data];
        setUser(prev => ({ ...prev, wishlist: newWishlist }));
        toast.success("Saved to wishlist");
      }
    } catch (error) {
      toast.error("Could not update wishlist");
    } finally {
      setUpdating(false);
    }
  };

  // 🔗 SHARE FUNCTIONALITY
  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Discover the ${product.name} at Horologie.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) { console.log("Share cancelled"); }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(<div className="flex items-center gap-2"><LinkIcon size={14} /> Link copied to clipboard</div>);
      } catch (err) { toast.error("Failed to copy link"); }
    }
  };

  if (loading) return <div className="h-screen bg-white flex items-center justify-center"><div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div></div>;
  if (!product) return null;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-yellow-100 selection:text-black">
      <GrainOverlay />

      <div className="fixed top-24 left-6 md:left-12 z-30 mix-blend-difference text-gray-500">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs uppercase tracking-widest hover:text-gray-300 transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      <div className="max-w-[90rem] mx-auto px-6 md:px-12 py-32 md:py-40">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* LEFT: GALLERY */}
          <div className="w-full lg:w-3/5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/3] bg-gray-50 rounded-sm overflow-hidden border border-gray-100 cursor-zoom-in group"
              onClick={() => setFullscreenMedia(activeImage)}
            >
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain p-12 transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>

            <div className="grid grid-cols-4 gap-4">
              <button 
                onClick={() => setActiveImage(product.image)}
                className={`aspect-square bg-gray-50 border transition-all p-2 rounded-sm ${activeImage === product.image ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <img src={product.image} className="w-full h-full object-contain" />
              </button>
              {product.gallery?.slice(0, 2).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square bg-gray-50 border transition-all p-2 rounded-sm ${activeImage === img ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'}`}
                >
                  <img src={img} className="w-full h-full object-contain" />
                </button>
              ))}
              {product.video && (
                <button
                  onClick={() => setFullscreenMedia(product.video)}
                  className="aspect-square bg-gray-50 border border-gray-200 hover:border-black transition-all relative group overflow-hidden rounded-sm"
                >
                  <video src={product.video} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <Play size={10} className="fill-black text-black ml-0.5" />
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="w-full lg:w-2/5 relative">
            <div className="lg:sticky lg:top-32 space-y-10">
              
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">
                    {product.brand || "Horologie"}
                  </span>
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                    {product.stock > 0 ? "Available" : "Sold Out"}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-end gap-4 mb-8">
                  <span className="text-3xl font-light text-gray-900">
                    ₹{Number(product.price).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400 mb-2 font-mono">
                    REF: {String(product.id).padStart(6, '0')}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed font-light pl-4 border-l-2 border-gray-200">
                  {product.description}
                </p>
              </motion.div>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <button
                  onClick={handleAddCart}
                  disabled={updating || product.stock === 0}
                  className={`w-full py-4 px-6 flex items-center justify-center gap-3 uppercase text-xs font-bold tracking-[0.15em] transition-all duration-300 ${
                    product.stock === 0 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-800 text-white hover:bg-yellow-700 shadow-xl shadow-gray-200"
                  }`}
                >
                  {updating ? "Processing..." : product.stock === 0 ? "Unavailable" : <><ShoppingBag size={16} /> Add to Bag</>}
                </button>

                <div className="grid grid-cols-2 gap-4">
                   <button
                    onClick={handleToggleWishlist}
                    disabled={updating}
                    className={`py-3 flex items-center justify-center gap-2 border text-[10px] uppercase tracking-widest transition-all ${
                      isWished 
                      ? "border-red-200 bg-red-50 text-red-500" 
                      : "border-gray-200 text-gray-500 hover:border-black hover:text-black"
                    }`}
                  >
                    <Heart size={14} className={isWished ? "fill-current" : ""} /> 
                    {isWished ? "Saved" : "Wishlist"}
                  </button>
                  
                  <button 
                    onClick={handleShare}
                    className="py-3 flex items-center justify-center gap-2 border border-gray-200 text-gray-500 hover:border-black hover:text-black transition-all text-[10px] uppercase tracking-widest"
                  >
                    <Share2 size={14} /> Share
                  </button>
                </div>
              </div>

              <div className="pt-8">
                <h3 className="text-xs text-black uppercase tracking-widest mb-6 border-b border-gray-100 pb-2 font-bold">Specifications</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-xs">
                    <div><span className="text-gray-400 block mb-1">Movement</span><span className="text-gray-900 font-medium">Automatic</span></div>
                    <div><span className="text-gray-400 block mb-1">Material</span><span className="text-gray-900 font-medium">Oystersteel</span></div>
                    <div><span className="text-gray-400 block mb-1">Dial</span><span className="text-gray-900 font-medium">{product.color || "Standard"}</span></div>
                    <div><span className="text-gray-400 block mb-1">Resistance</span><span className="text-gray-900 font-medium">100m / 330ft</span></div>
                </div>
              </div>

              {/* ✅ UPDATED TRUST INDICATORS WITH SWISS BADGE */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 text-[10px] text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-yellow-700" /> 5-Year Warranty</div>
                <div className="flex items-center gap-2 font-bold text-gray-600">
                    <SwissShieldIcon className="text-yellow-700" /> Swiss Made mark.
                </div>
                <div className="flex items-center gap-2"><Truck size={14} className="text-yellow-700" /> Free Shipping</div>
                {/* New Swiss Made Badge */}
                
              </div>

            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {fullscreenMedia && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFullscreenMedia(null)}
            className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[60] flex items-center justify-center cursor-zoom-out p-4 md:p-12"
          >
            {fullscreenMedia.endsWith(".mp4") ? (
              <video src={fullscreenMedia} autoPlay controls className="max-w-full max-h-full shadow-2xl" />
            ) : (
              <img src={fullscreenMedia} alt="Full View" className="max-w-full max-h-full object-contain shadow-2xl" />
            )}
            <button className="absolute top-6 right-6 text-gray-400 hover:text-black font-light text-sm tracking-widest">CLOSE</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;