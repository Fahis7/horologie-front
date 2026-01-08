import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// 1. ANIMATED TICK COMPONENT
// Adjusted delays to sync perfectly with the video intro
const AnimatedTick = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "1px solid black",
          opacity: 0, // Start invisible
          // Wait 2.6s (Intro video) then pop in
          animation: "scaleIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 2.6s forwards", 
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          style={{ overflow: "visible" }}
        >
          <path
            d="M5 13l4 4L19 7"
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="24"
            strokeDashoffset="24"
            // Wait 3.0s then draw checkmark
            style={{ animation: "draw 0.4s ease-out 3.0s forwards" }} 
          />
        </svg>
      </div>
      <style>{`
          @keyframes scaleIn { 
            0% { transform: scale(0); opacity: 0; } 
            70% { transform: scale(1.1); opacity: 1; } 
            100% { transform: scale(1); opacity: 1; } 
          }
          @keyframes draw { 
            to { stroke-dashoffset: 0; } 
          }
        `}</style>
    </div>
  );
};

// 2. MAIN CONFIRMATION PAGE
const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;
  
  // State for the Cinematic Intro Video
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (!order) {
      navigate("/");
    }

    // Timer: Play reveal video for 2.5 seconds, then fade out
    const timer = setTimeout(() => {
        setShowIntro(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [order, navigate]);

  if (!order) return null;

  // Handlers
  const handleViewCertificate = () => {
    if (order.items && order.items.length > 0) {
      navigate("/certificate", { 
        state: { item: order.items[0].product, date: order.created_at } 
      });
    }
  };

  const handleConcierge = () => {
    const phoneNumber = "918129458920"; 
    const message = `Greetings Horologie. I have an inquiry regarding my recent acquisition (Order #${order.id}).`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-black flex relative">
      
      {/* ========================================= */}
      {/* ✅ CINEMATIC REVEAL OVERLAY (Idea 1)      */}
      {/* ========================================= */}
      <div 
        className="fixed inset-0 z-50 bg-white flex items-center justify-center transition-opacity duration-1000 ease-out pointer-events-none" 
        style={{ opacity: showIntro ? 1 : 0 }}
      >
         {/* Abstract Golden Light Leak Video */}
         <video 
            autoPlay 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60"
         >
            <source src="https://cdn.coverr.co/videos/coverr-light-leaks-on-black-background-4537/1080p.mp4" type="video/mp4" />
         </video>

         <div className="relative z-10 text-center">
             <h1 className="text-gray-900 font-serif text-3xl md:text-5xl tracking-[0.5em] animate-pulse mb-3">
                HOROLOGIE
             </h1>
             <p className="text-yellow-500 text-[10px] uppercase tracking-widest font-light">
                Securing Acquisition...
             </p>
         </div>
      </div>

      {/* ========================================= */}
      {/* LEFT: LUXURY VIDEO PANEL (Static)         */}
      {/* ========================================= */}
      <div className="hidden md:block w-2/5 relative h-screen overflow-hidden sticky top-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-70 z-10"></div>
        <video autoPlay loop muted className="w-full h-full object-cover">
          <source src="https://media.rolex.com/video/upload/c_limit,q_auto:eco,w_2880/vc_vp9/v1/rolexcom/new-watches/2025/watches/new-dials/videos/player-expand/long-film/new-watches-2025-new-dials-presentation-long-film.webm" type="video/webm" />
        </video>
        <div className="absolute bottom-1/4 left-0 right-0 z-20 px-8 text-center">
          <p className="text-white font-light tracking-widest text-lg mb-2">"YOUR LEGACY BEGINS NOW"</p>
          <p className="text-yellow-600 text-xs font-light opacity-80">- Master Horologist</p>
        </div>
      </div>

      {/* ========================================= */}
      {/* RIGHT: CONFIRMATION DETAILS               */}
      {/* ========================================= */}
      <div className="w-full md:w-3/5 bg-white flex items-center justify-center p-8 overflow-y-auto h-screen">
        <div className="max-w-md w-full text-center py-10 mt-8">
          
          <AnimatedTick />
          
          <h2 className="text-2xl font-thin tracking-widest text-gray-900 mb-2">ACQUISITION CONFIRMED</h2>
          <p className="text-xs font-light text-gray-500 opacity-70 mb-6 uppercase">Your investment is secured</p>

          {/* ✅ DIGITAL ASSETS SECTION */}
          <div className="bg-gray-50 border border-gray-200 p-6 mb-4 relative overflow-hidden text-left group hover:shadow-lg transition-shadow duration-300">
             <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-600 to-transparent"></div>
             
             <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xs font-bold text-gray-900 tracking-widest mb-1">DIGITAL CERTIFICATE</h3>
                    <p className="text-[10px] text-gray-500 uppercase">Official Proof of Ownership</p>
                </div>
                <div className="h-8 w-8 bg-black rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-yellow-500 font-serif font-bold italic">H</span>
                </div>
             </div>
             
             <button 
               onClick={handleViewCertificate}
               className="w-full py-3 bg-white border border-yellow-600 text-yellow-700 text-xs font-bold uppercase tracking-widest hover:bg-yellow-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               View Certificate
             </button>
          </div>

          {/* ✅ IDEA 2: GOLD CONCIERGE BUTTON */}
          <div className="mb-8">
            <button 
                onClick={handleConcierge}
                className="w-full py-4 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-white text-xs font-bold uppercase tracking-[0.2em] hover:shadow-lg hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-3 shadow-md"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.698c.93.509 1.842.769 2.808.769 3.181 0 5.768-2.587 5.768-5.766.001-3.182-2.585-5.769-5.766-5.769zm9.261 4.911c0 8.952-11.009 16.902-13.685 18.916v-2.138c1.372-1.282 3.517-3.649 5.079-6.002.402-1.038.628-2.905.628-4.908 0-4.344-3.531-7.875-7.875-7.875-1.928 0-3.692.73-5.068 1.932-1.428 1.251-2.28 3.064-2.28 5.051 0 1.957.596 3.784 1.776 5.394l-1.611 5.894 6.014-1.581c1.472.637 2.895.968 4.359.968 1.139 0 2.219-.204 3.243-.574 4.303-1.554 7.42-5.733 7.42-10.373 0-5.467-4.437-9.916-9.893-9.916-4.576 0-8.418 3.127-9.569 7.394-.657 2.418.169 5.176 2.373 7.698 1.575 1.796 3.96 4.902 4.095 5.069h3.702c-.104-.154-3.411-4.135-4.499-5.328-1.547-1.696-2.128-3.468-1.748-5.267.653-3.089 3.328-5.305 6.467-5.305 3.655 0 6.635 2.972 6.635 6.626z"/>
                </svg>
                Contact Private Concierge
            </button>
            <p className="text-[10px] text-gray-400 mt-2">
                Available 24/7 for VIP Clients
            </p>
          </div>

          {/* Order Details */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between text-xs font-light text-gray-600 mb-2">
              <span>Order Reference</span>
              <span className="font-mono font-medium">#{order.id}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-900 mt-4 pt-2 border-t border-gray-200">
              <span>Total Investment</span>
              <span>₹{Number(order.total_price).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => navigate("/")} className="w-1/2 bg-gray-900 text-white py-3 px-4 text-xs font-bold tracking-widest hover:bg-black transition-all duration-300">
              RETURN HOME
            </button>
            <button onClick={() => navigate("/orders")} className="w-1/2 border border-gray-900 text-gray-900 py-3 px-4 text-xs font-bold tracking-widest hover:bg-gray-50 transition-all duration-300">
              VIEW ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;