import Navbar from "../layout/Navbar";
import { useEffect, useState, useRef } from "react";
import API from "../../api/Api";
import ProductCard from "../common/components/ProductCard";
import Footer from "../layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, ChevronDown, X, ArrowRight } from "lucide-react";

// --- HELPERS ---
const getColorHex = (colorName) => {
  const map = {
    Black: "#1a1a1a",
    Blue: "#1e3a8a",
    Gold: "#d4af37",
    Silver: "#e5e7eb",
    White: "#ffffff",
    Green: "#064e3b",
    Rose: "#be123c",
    Bronze: "#78350f",
  };
  return map[colorName] || "#333";
};

const GrainOverlay = () => (
  <div
    className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-multiply"
    style={{
      backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")`,
    }}
  />
);

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedColor, setSelectedColor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const intervalRef = useRef(null);
  const AUTOPLAY_DURATION = 6000; // 6 seconds

  const bannerImages = [
    {
      url: "https://media.rolex.com/image/upload/q_auto:eco/f_auto/c_limit,w_1920/v1722242026/rolexcom/collection/family-pages/classic-watches/day-date/family-page/2024/classic-watches-day-date-M228238-0066_2401jva_002",
      title: "The Art of Horology",
      subtitle: "Craftsmanship that defies time.",
      description: "Discover the pinnacle of Swiss engineering and timeless design.",
    },
    {
      url: "https://media.rolex.com/image/upload/q_auto:eco/f_auto/c_limit,w_1920/v1/rolexcom/model-page/gallery/m226570-0001/m226570-0001_v03",
      title: "Essential Elegance",
      subtitle: "A collection curated for the discerning.",
      description: "Iconic silhouettes reimagined for the modern collector.",
    },
    {
      url: "https://patek-res.cloudinary.com/dfsmedia/0906caea301d42b3b8bd23bd656d1711/175678-51883",
      title: "Legacy & Precision",
      subtitle: "Invest in a masterpiece.",
      description: "Heirlooms built to last generations, available now.",
    },
  ];

  const brands = ["All", ...new Set(products.map((product) => product.brand).filter(Boolean))];
  const colors = [...new Set(products.flatMap((product) => product.color).filter(Boolean))];

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProducts = async () => {
      try {
        const response = await API.get("/products/");
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    fetchProducts();
  }, []);

  // --- AUTOPLAY LOGIC ---
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, AUTOPLAY_DURATION);
    return () => clearInterval(intervalRef.current);
  }, []);

  // --- FILTER LOGIC ---
  useEffect(() => {
    let result = products || [];

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(query)) || 
        (p.brand && p.brand.toLowerCase().includes(query))
      );
    }

    if (selectedBrand !== "All") {
      result = result.filter((product) => product.brand === selectedBrand);
    }

    if (selectedColor) {
      result = result.filter((product) => product.color === selectedColor);
    }

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    }

    setFilteredProducts(result);
  }, [selectedBrand, selectedColor, searchQuery, sortBy, products]);

  // --- ANIMATION VARIANTS ---
  const slideVariants = {
    initial: { scale: 1.3, filter: "blur(10px)", opacity: 0 },
    animate: { scale: 1, filter: "blur(0px)", opacity: 1, transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { scale: 1.1, filter: "blur(5px)", opacity: 0, transition: { duration: 0.8 } }
  };

  const textVariants = {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 } },
    exit: { y: -50, opacity: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-yellow-100 selection:text-black">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <div className="relative w-full h-[85vh] overflow-hidden bg-black">
        <AnimatePresence mode="wait">
            {/* BACKGROUND IMAGE */}
            <motion.img
                key={currentBannerIndex}
                src={bannerImages[currentBannerIndex].url}
                alt="Banner"
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
            />
        </AnimatePresence>

        {/* DARK GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {/* CONTENT */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-20 pb-24 md:pb-32">
            <div className="max-w-4xl border-l-2 border-yellow-600 pl-8 md:pl-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentBannerIndex}
                        variants={textVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <h2 className="text-yellow-500 text-xs md:text-sm font-bold tracking-[0.4em] uppercase mb-4">
                            {bannerImages[currentBannerIndex].subtitle}
                        </h2>
                        <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-[0.9] tracking-tight">
                            {bannerImages[currentBannerIndex].title}
                        </h1>
                        <p className="text-gray-300 text-sm md:text-lg max-w-lg font-light leading-relaxed">
                            {bannerImages[currentBannerIndex].description}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
      </div>

      {/* 2. STICKY UTILITY BAR */}
      <div className=" bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all shadow-sm">
         <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="relative w-full md:w-auto group">
                <Search className="absolute left-0 top-2.5 text-gray-400 w-4 h-4 group-focus-within:text-yellow-700 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search model or reference..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-b border-gray-300 text-sm py-2 pl-6 pr-4 w-full md:w-72 focus:outline-none focus:border-yellow-700 transition-colors placeholder-gray-400 font-light"
                />
            </div>

            <div className="flex items-center gap-8">
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${showFilters ? 'text-yellow-700' : 'text-gray-500 hover:text-black'}`}
                >
                    <SlidersHorizontal size={14} />
                    {showFilters ? "Hide Filters" : "Filter Collection"}
                </button>

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                    <span>Sort By</span>
                    <div className="relative">
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-gray-700 focus:outline-none cursor-pointer hover:text-yellow-700 appearance-none pr-4 font-bold"
                        >
                            <option value="featured">Featured</option>
                            <option value="price-asc">Price (Low)</option>
                            <option value="price-desc">Price (High)</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-0 top-1.5 pointer-events-none"/>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* 3. FILTER DRAWER */}
      <AnimatePresence>
        {showFilters && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gray-50 border-b border-gray-200 overflow-hidden"
            >
                <div className="max-w-7xl mx-auto py-10 px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
                    
                    <div>
                        <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 font-bold">Maison</h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-3">
                            {brands.map((brand) => (
                                <button
                                    key={brand}
                                    onClick={() => setSelectedBrand(brand)}
                                    className={`text-sm transition-all duration-300 relative group ${
                                        selectedBrand === brand
                                        ? "text-black font-semibold"
                                        : "text-gray-500 hover:text-black"
                                    }`}
                                >
                                    {brand}
                                    <span className={`absolute -bottom-1 left-0 w-full h-[1px] bg-yellow-700 transition-transform origin-left ${selectedBrand === brand ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`}></span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Dial / Material</h3>
                             {selectedColor && (
                                 <button onClick={() => setSelectedColor("")} className="text-[10px] text-red-500 hover:text-red-700 flex items-center transition-colors">
                                     <X size={10} className="mr-1"/> Clear Selection
                                 </button>
                             )}
                         </div>
                         <div className="flex flex-wrap gap-3">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(selectedColor === color ? "" : color)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative group border ${
                                        selectedColor === color ? "border-yellow-700 p-0.5" : "border-transparent hover:border-gray-300"
                                    }`}
                                    title={color}
                                >
                                    <div 
                                        className="w-full h-full rounded-full shadow-sm border border-black/5"
                                        style={{ backgroundColor: getColorHex(color) }} 
                                    />
                                    {selectedColor === color && (
                                        <div className="absolute -bottom-6 text-[9px] text-black font-medium">{color}</div>
                                    )}
                                </button>
                            ))}
                         </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 4. PRODUCT GRID */}
      <div className="max-w-7xl mx-auto py-20 px-6">
        
        {/* Active Filters */}
        {(selectedBrand !== "All" || selectedColor) && (
            <div className="flex items-center justify-center gap-4 mb-12">
                <span className="text-gray-400 text-xs uppercase tracking-widest">Active:</span>
                {selectedBrand !== "All" && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs uppercase tracking-wider rounded-sm flex items-center gap-2">
                        {selectedBrand} <button onClick={() => setSelectedBrand("All")}><X size={12}/></button>
                    </span>
                )}
                {selectedColor && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs uppercase tracking-wider rounded-sm flex items-center gap-2">
                        {selectedColor} <button onClick={() => setSelectedColor("")}><X size={12}/></button>
                    </span>
                )}
            </div>
        )}

        {filteredProducts.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center text-gray-400">
                <div className="w-16 h-16 border border-gray-200 rounded-full flex items-center justify-center mb-6">
                    <Search size={24} className="opacity-30" />
                </div>
                <h3 className="font-serif text-2xl text-gray-800 mb-2">No timepieces found</h3>
                <p className="text-sm font-light max-w-md">We couldn't find any watches matching your criteria. Try adjusting your filters.</p>
                <button 
                    onClick={() => {setSelectedBrand("All"); setSelectedColor(""); setSearchQuery("");}}
                    className="mt-8 px-8 py-3 bg-black text-white text-xs uppercase tracking-widest hover:bg-yellow-700 transition-colors"
                >
                    Reset Collection
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                <AnimatePresence>
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.6, ease: "easeOut" }}
                        >
                            <ProductCard
                                product={product}
                                description={product.description}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        )}
        
        {filteredProducts.length > 0 && (
             <div className="mt-20 pt-10 border-t border-gray-100 text-center">
                 <div className="w-8 h-8 mx-auto mb-4 border border-gray-300 rounded-full flex items-center justify-center">
                     <span className="font-serif italic text-gray-400 text-xs">H</span>
                 </div>
                 <p className="text-xs text-gray-400 uppercase tracking-widest">End of Collection</p>
             </div>
        )}

      </div>
    </div>
  );
}

export default Products;