import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Check, Eye, EyeOff, ArrowLeft } from "lucide-react";
import API from "../../../../api/Api";
import { toast } from "react-toastify";

// --- VISUAL ASSETS ---
const GrainOverlay = () => (
  <div
    className="fixed inset-0 pointer-events-none z-0 opacity-[0.04] mix-blend-multiply"
    style={{
      backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")`,
    }}
  />
);

export default function RegisterConcierge() {
  const navigate = useNavigate();
  
  // State Management
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const totalSteps = 3;

  // --- HANDLERS ---

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step < totalSteps) {
      if (validateStep(step)) {
        setDirection(1);
        setStep(step + 1);
      }
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (!formData.first_name || !formData.last_name) {
          toast.error("Please tell us your name.");
          return false;
        }
        return true;
      case 2:
        if (!formData.email || !formData.email.includes("@")) {
          toast.error("A valid email is required for correspondence.");
          return false;
        }
        return true;
      case 3:
        if (!formData.password || formData.password.length < 6) {
          toast.error("Password must be at least 6 characters.");
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await API.post("/auth/register/", formData);
      toast.success(response.data.message || "Membership Approved.");
      
      // Delay for effect
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed.";
      toast.error(msg);
      setIsLoading(false);
    }
  };

  // --- ANIMATION VARIANTS ---
  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col lg:items-center lg:justify-center overflow-hidden relative font-sans selection:bg-yellow-900 selection:text-white">
      <GrainOverlay />
      
      {/* BACKGROUND ACCENT */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-yellow-600/5 rounded-full blur-[50px] sm:blur-[80px] md:blur-[100px] pointer-events-none" />

      {/* MOBILE HEADER */}
      <div className="lg:hidden w-full p-4 flex items-center justify-between border-b border-gray-900 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <div className="w-5 h-5 text-yellow-500 text-sm font-serif">H</div>
          </div>
          <div>
            <h1 className="text-lg font-serif text-white">Horologie.</h1>
            <p className="text-yellow-500 text-[10px] tracking-[0.2em] uppercase">
              Est. 1924
            </p>
          </div>
        </div>
        <Link 
          to="/"
          className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 border border-gray-800 rounded-full"
        >
          Back to Home
        </Link>
      </div>

      {/* DESKTOP HEADER LOGO */}
      <div className="hidden lg:block absolute top-8 left-0 right-0 flex justify-center z-20">
         <div className="text-center">
             <h1 className="font-serif text-xl tracking-wider text-white">Horologie.</h1>
             <p className="text-[9px] uppercase tracking-[0.3em] text-yellow-600">The Concierge</p>
         </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="w-full flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 relative z-10">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            
            {/* STEP 1: NAMES */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "anticipate" }}
                className="flex flex-col items-center text-center px-2"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-6 sm:mb-8 leading-tight">
                  Whom do we have the <br className="hidden sm:block" /> pleasure of addressing?
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 w-full max-w-lg">
                  <input
                    autoFocus
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent border-b border-gray-800 text-lg sm:text-xl md:text-2xl lg:text-3xl py-3 sm:py-4 text-center focus:border-yellow-600 focus:outline-none placeholder-gray-700 transition-colors"
                  />
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent border-b border-gray-800 text-lg sm:text-xl md:text-2xl lg:text-3xl py-3 sm:py-4 text-center focus:border-yellow-600 focus:outline-none placeholder-gray-700 transition-colors"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: EMAIL */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "anticipate" }}
                className="flex flex-col items-center text-center px-2"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-6 sm:mb-8 leading-tight">
                  Where shall we send <br className="hidden sm:block" /> your correspondence?
                </h2>
                <div className="w-full max-w-lg">
                  <input
                    autoFocus
                    type="email"
                    name="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent border-b border-gray-800 text-lg sm:text-xl md:text-2xl lg:text-3xl py-3 sm:py-4 text-center focus:border-yellow-600 focus:outline-none placeholder-gray-700 transition-colors"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 3: PASSWORD */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "anticipate" }}
                className="flex flex-col items-center text-center px-2"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-6 sm:mb-8 leading-tight">
                  Finally, secure your <br className="hidden sm:block" /> personal vault.
                </h2>
                <div className="w-full max-w-lg relative">
                  <input
                    autoFocus
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create Password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent border-b border-gray-800 text-lg sm:text-xl md:text-2xl lg:text-3xl py-3 sm:py-4 text-center focus:border-yellow-600 focus:outline-none placeholder-gray-700 transition-colors pr-12"
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors p-2"
                  >
                      {showPassword ? <EyeOff size={20} className="sm:w-5 sm:h-5" /> : <Eye size={20} className="sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* NAVIGATION CONTROLS */}
      <div className="w-full px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-16 flex flex-col items-center z-20">
        
        {/* Mobile Back Button (Top) */}
        <div className="lg:hidden w-full mb-6">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>

        {/* Progress Bar - Top on mobile, bottom on desktop */}
        <div className="w-full max-w-md mb-6 sm:mb-8">
          <div className="w-full h-0.5 bg-gray-900 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-yellow-600"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">Step {step} of {totalSteps}</span>
            <span className="text-xs text-yellow-500">{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 w-full max-w-md">
          {/* Desktop Back Button */}
          <button 
            onClick={prevStep}
            disabled={step === 1 || isLoading}
            className={`hidden lg:flex w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-800 items-center justify-center transition-all
              ${step === 1 ? 'opacity-0 cursor-default' : 'hover:border-white hover:bg-white/5 opacity-100'}`}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Next / Submit Button */}
          <button 
            onClick={nextStep}
            disabled={isLoading}
            className="group flex items-center justify-center gap-3 bg-white text-black px-6 sm:px-8 py-3 sm:py-3 rounded-full hover:bg-yellow-500 transition-all duration-300 disabled:opacity-50 w-full sm:w-auto"
          >
            <span className="uppercase text-xs sm:text-sm font-bold tracking-widest">
              {isLoading ? "Minting Key..." : step === totalSteps ? "Finish Registration" : "Continue"}
            </span>
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : step === totalSteps ? (
              <Check size={16} className="sm:w-4 sm:h-4" />
            ) : (
              <ArrowRight size={16} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </div>

        {/* Login Link */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link to="/login" className="text-gray-500 text-xs sm:text-sm hover:text-white transition-colors border-b border-transparent hover:border-gray-500 pb-1">
            Already have a membership? Login here
          </Link>
        </div>

      </div>
    </div>
  );
}