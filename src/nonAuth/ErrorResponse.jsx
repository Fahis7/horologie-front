import React from "react";
import { useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ivory mt-10 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle watch gear pattern in background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full border border-platinum rotate-45"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full border border-platinum rotate-12"></div>
        <div className="absolute bottom-1/4 left-1/3 w-28 h-28 rounded-full border border-platinum rotate-30"></div>
        <div className="absolute bottom-1/3 right-1/3 w-20 h-20 rounded-full border border-platinum"></div>
      </div>

      {/* Luxury brand crest */}
      <div className="absolute top-8 left-0 right-0 flex justify-center space-x-10 opacity-30">
        <svg
          className="w-16 h-16"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="32" cy="32" r="30" stroke="#C0C0C0" strokeWidth="1" />
          <path
            d="M32 12L40 32L32 52L24 32L32 12Z"
            stroke="#C0C0C0"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* Watch-inspired 404 design */}
        <div className="relative mx-auto w-64 h-64 mb-16 flex items-center justify-center">
          {/* Watch face layers */}
          <div className="absolute inset-0 rounded-full border border-platinum shadow-inner"></div>
          <div className="absolute inset-6 rounded-full border border-gold opacity-30"></div>
          <div className="absolute inset-12 rounded-full border border-platinum opacity-20"></div>

          {/* Hour markers */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-3 bg-platinum"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-28px)`,
                top: "50%",
                left: "50%",
              }}
            />
          ))}

          {/* 404 text with watch-like typography */}
          <span className="text-7xl font-thin text-charcoal tracking-tight relative">
            <span className="text-gold">4</span>
            <span className="opacity-90">0</span>
            <span className="text-gold">4</span>
          </span>
        </div>

        <h1 className="text-2xl font-thin tracking-widest text-charcoal mb-4">
          PAGE NOT FOUND
        </h1>
        <p className="text-sm font-light text-charcoal opacity-80 mb-12 max-w-md mx-auto leading-relaxed">
          The horological masterpiece you seek is not at this exhibition. Our
          master watchmakers suggest these alternatives:
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-12 py-3 border border-charcoal text-charcoal text-sm font-light tracking-widest cursor-pointer 
             hover:bg-gray-700 hover:text-white hover:border-charcoal 
             transition-all duration-300 flex items-center justify-center group"
          >
            <span className="mr-2 transition-transform duration-300 group-hover:-translate-x-1">
              ⟵
            </span>
            HOROLOGIE
          </button>
        </div>

        <div className="mt-24 pt-8 border-t border-platinum border-opacity-30">
          <p className="text-xs font-light text-charcoal opacity-50 tracking-widest">
            PATENTED HOROLOGICAL ERROR RECOVERY SYSTEM
          </p>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
