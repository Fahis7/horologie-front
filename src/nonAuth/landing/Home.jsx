import React, { useEffect, useRef } from "react";
import Navbar from "../../layout/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";

// --- 1. OPTIMIZED GRAIN: Uses a lightweight image instead of heavy SVG calculation ---
const GrainOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.05] mix-blend-multiply pointer-events-none">
    {/* Lightweight Noise Texture */}
    <div 
      className="w-full h-full"
      style={{ 
        backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")`,
        backgroundRepeat: 'repeat'
      }}
    />
  </div>
);

// --- 2. MAGNETIC BUTTON (Unchanged, it's efficient) ---
const MagneticButton = ({ children, className, to }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const center = { x: left + width / 2, y: top + height / 2 };
    x.set(clientX - center.x);
    y.set(clientY - center.y);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
    >
      <Link to={to} className={className}>
        {children}
      </Link>
    </motion.div>
  );
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.2 } }
};

const fadeInUp = {
  hidden: { y: 60, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] } }
};

const slideInFromLeft = {
  hidden: { x: -50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
};

const slideInFromRight = {
  hidden: { x: 50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
};

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Parallax Hooks
  const { scrollY } = useScroll();
  const heroTextY = useTransform(scrollY, [0, 500], [0, 200]); 
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]); 

  useEffect(() => {
    if (user && user.role === "admin") {
      navigate("/admin");
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div id="heritage" className="bg-[#faf9f5] relative">
      <GrainOverlay /> 
      <Navbar />
      
      {/* Import Google Font for Signature */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        .font-signature { font-family: 'Great Vibes', cursive; }
      `}</style>

      <div className="text-gray-800 font-serif">
        
        {/* --- HERO SECTION --- */}
        <section className="h-screen flex items-center justify-center relative overflow-hidden bg-black">
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-105"
            >
              <source
                src="https://media.rolex.com/video/upload/c_limit,q_auto:eco,w_2880/vc_vp9/v1/rolexcom/new-watches/2025/watches/datejust-31/videos/player-expand/long-film/new-watches-2025-datejust-31-presentation-long-film.webm"
                type="video/webm"
              />
            </video>
            <div className="absolute inset-0 bg-black/30"></div> 
          </div>

          <motion.div 
            className="relative z-10 p-8 max-w-4xl text-center will-change-transform" // Optimized for GPU
            style={{ y: heroTextY, opacity: heroOpacity }}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-wider mb-8 leading-none text-white drop-shadow-2xl" variants={fadeInUp}>
              <motion.span className="block font-playfair italic text-gold-500">
                Horological
              </motion.span>
              <motion.span className="block font-thin mt-2 uppercase tracking-[0.2em] text-8xl sm:text-4xl">
                Mastery
              </motion.span>
            </motion.h1>
            
            <motion.p className="text-xl mb-12 text-gray-100 font-extralight tracking-widest leading-relaxed max-w-2xl mx-auto mix-blend-overlay" variants={fadeInUp}>
              Where centuries of craftsmanship meet timeless elegance. Each tick echoes the pinnacle of human achievement.
            </motion.p>
            
            <motion.div className="flex justify-center" variants={fadeInUp}>
              <MagneticButton 
                to="/products"
                className="bg-white/10 backdrop-blur-sm border border-white/40 text-white px-10 py-4 hover:bg-white hover:text-black transition-all duration-500 text-sm font-bold tracking-[0.2em] uppercase"
              >
                Explore Collections
              </MagneticButton>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/50 text-xs tracking-[0.3em] uppercase"
            animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Scroll to Discover
          </motion.div>
        </section>

        {/* --- FEATURED COLLECTION --- */}
        <section id="featured" className="py-32 bg-[#f8f5f0] overflow-hidden">
          <div className="max-w-7xl mx-auto px-8">
            <motion.div 
              className="text-center mb-24"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-light mb-4 text-gray-800 tracking-[0.2em] uppercase">
                <span className="border-b border-gold-500 pb-4">Signature Timepieces</span>
              </h2>
              <p className="text-gray-500 font-serif italic mt-6 text-lg">
                "Precision is not just a metric, it is an emotion."
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  name: "Patek Philippe Grandmaster",
                  image: "https://i.pinimg.com/1200x/61/ea/89/61ea895c7ff6a79796b4e88b95681e51.jpg",
                  price: "$2,200,000",
                  ref: "Ref. 6300A"
                },
                {
                  name: "Rolex Daytona Platinum",
                  image: "https://i.pinimg.com/1200x/d3/d0/72/d3d072d0afc8ee5ed3946cca8867a49a.jpg",
                  price: "$115,000",
                  ref: "Ref. 116506"
                },
                {
                  name: "Rado Captain Cook",
                  image: "https://i.pinimg.com/1200x/52/32/62/523262305e9299699f5edf5af496789b.jpg",
                  price: "$4,200",
                  ref: "Ref. R321"
                },
              ].map((watch, index) => (
                <motion.div 
                  key={index} 
                  className="group relative cursor-pointer"
                  initial={{ opacity: 0, y: 100 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <div className="relative overflow-hidden h-[500px] w-full bg-gray-200">
                    <motion.img
                      src={watch.image}
                      alt={watch.name}
                      className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out will-change-transform" // Optimized
                      whileHover={{ scale: 1.05 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                    
                    <div className="absolute bottom-8 left-8 text-white z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <p className="text-xs tracking-[0.2em] text-gold-400 mb-2">{watch.ref}</p>
                        <h3 className="text-2xl font-serif leading-tight mb-2">{watch.name}</h3>
                        <div className="h-[1px] w-0 group-hover:w-full bg-white/50 transition-all duration-700 ease-out mb-4"></div>
                        <p className="text-sm font-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{watch.price}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- ANATOMY OF TIME --- */}
        <section className="py-0 relative bg-black text-white overflow-hidden">
            <div className="absolute inset-0 opacity-40">
                <img 
                    src="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=2574&auto=format&fit=crop" 
                    alt="Watch Movement Macro" 
                    className="w-full h-full object-cover grayscale"
                    loading="lazy" // Optimized
                />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-8 py-40 flex flex-col md:flex-row items-center justify-between">
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                    className="md:w-1/2"
                >
                    <h2 className="text-5xl md:text-7xl font-serif mb-6">The Anatomy <br/><span className="text-gray-500 italic">of Time</span></h2>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="md:w-1/3 backdrop-blur-md bg-white/5 p-8 border border-white/10"
                >
                    <p className="text-gray-300 font-light leading-loose">
                        True luxury is found in the unseen. Behind every dial lies a world of microscopic precision—gears, springs, and escapements working in a symphony of mechanics.
                    </p>
                    <Link to="/products" className="inline-block mt-8 text-xs tracking-[0.2em] border-b border-white pb-1 hover:text-gold-400 hover:border-gold-400 transition-colors">
                        DISCOVER OUR CRAFTSMANSHIP
                    </Link>
                </motion.div>
            </div>
        </section>

        {/* --- HERITAGE SECTION (Fixed Signature) --- */}
        <section className="py-32 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row items-center gap-16">
              
              <motion.div 
                className="md:w-1/2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideInFromLeft}
              >
                <h2 className="text-xs text-gold-600 tracking-[0.3em] uppercase mb-4 font-bold">Est. 1924</h2>
                <h3 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8 leading-tight">
                  A Century of <br/> Timeless Tradition
                </h3>
                
                <div className="space-y-6 text-gray-600 font-light leading-relaxed text-lg">
                  <p>
                    Since 1924, we have been custodians of horological excellence.
                    Our family has built relationships with the finest watchmakers, 
                    bringing unparalleled craftsmanship to discerning collectors.
                  </p>
                  <p>
                    Each timepiece we offer is more than an instrument of time —
                    it's a legacy, a story, and an heirloom for generations to come.
                  </p>
                </div>

                {/* ✅ FIXED: Use a Cursive Font for Signature, NOT an image */}
                <div className="mt-12 opacity-80">
                   <h3 className="font-signature text-xl text-gray-800">
                     Alexandre Gauthier
                   </h3>
                   <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-2">Founder & Master Watchmaker</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="md:w-1/2 relative p-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideInFromRight}
              >
                <div className="relative z-10 overflow-hidden">
                    <motion.img
                      src="https://i.pinimg.com/736x/a7/b0/7c/a7b07c09035140becd5cf407f77a85a4.jpg"
                      alt="Watchmaker"
                      className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-out will-change-transform"
                      whileHover={{ scale: 1.03 }}
                    />
                </div>

                <motion.div 
                    className="absolute inset-0 border border-gray-900 z-0 translate-x-4 translate-y-4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                />
              </motion.div>

            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;