import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Check, Eye, EyeOff } from "lucide-react";
import API from "../../../../api/Api";
import { toast } from "react-toastify";

// --- VISUAL ASSETS ---
const GrainOverlay = () => (
  <div
    className="absolute inset-0 pointer-events-none z-0 opacity-[0.04] mix-blend-multiply"
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
    <div className="h-screen w-screen bg-[#050505] text-white flex flex-col items-center justify-center overflow-hidden relative font-sans selection:bg-yellow-900 selection:text-white">
      <GrainOverlay />
      
      {/* BACKGROUND ACCENT */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER LOGO */}
      <div className="absolute top-8 left-0 right-0 flex justify-center z-20">
         <div className="text-center">
             <h1 className="font-serif text-xl tracking-wider text-white">Horologie.</h1>
             <p className="text-[9px] uppercase tracking-[0.3em] text-yellow-600">The Concierge</p>
         </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="w-full max-w-2xl px-8 relative z-10">
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
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">
                Whom do we have the <br /> pleasure of addressing?
              </h2>
              <div className="flex flex-col md:flex-row gap-8 w-full max-w-lg">
                <input
                  autoFocus
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-b border-gray-800 text-2xl md:text-3xl py-4 text-center focus:border-yellow-600 focus:outline-none placeholder-gray-700 transition-colors"
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-b border-gray-800 text-2xl md:text-3xl py-4 text-center focus:border-yellow-600 focus:outline-none placeholder-gray-700 transition-colors"
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
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">
                Where shall we send <br /> your correspondence?
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
                  className="w-full bg-transparent border-b border-gray-800 text-2xl md:text-3xl py-4 text-center focus:border-yellow-600 focus:outline-none placeholder-gray-700 transition-colors"
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
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">
                Finally, secure your <br /> personal vault.
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
                  className="w-full bg-transparent border-b border-gray-800 text-2xl md:text-3xl py-4 text-center focus:border-yellow-600 focus:outline-none placeholder-gray-700 transition-colors pr-12"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors p-2"
                >
                    {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* NAVIGATION CONTROLS */}
      <div className="absolute bottom-16 left-0 right-0 px-8 flex flex-col items-center z-20">
        
        {/* Buttons */}
        <div className="flex items-center gap-6 mb-8">
            {/* Back Button */}
            <button 
                onClick={prevStep}
                disabled={step === 1 || isLoading}
                className={`w-12 h-12 rounded-full border border-gray-800 flex items-center justify-center transition-all
                    ${step === 1 ? 'opacity-0 cursor-default' : 'hover:border-white hover:bg-white/5 opacity-100'}`}
            >
                <ChevronLeft size={20} />
            </button>

            {/* Next / Submit Button */}
            <button 
                onClick={nextStep}
                disabled={isLoading}
                className="group flex items-center gap-3 bg-white text-black px-8 py-3 rounded-full hover:bg-yellow-500 transition-all duration-300 disabled:opacity-50"
            >
                <span className="uppercase text-xs font-bold tracking-widest">
                    {isLoading ? "Minting Key..." : step === totalSteps ? "Finish" : "Next"}
                </span>
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : step === totalSteps ? (
                    <Check size={16} />
                ) : (
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                )}
            </button>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-0.5 bg-gray-900 rounded-full overflow-hidden">
            <motion.div 
                className="h-full bg-yellow-600"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
            />
        </div>

        {/* Login Link */}
        <div className="mt-8">
             <Link to="/login" className="text-gray-500 text-xs hover:text-white transition-colors border-b border-transparent hover:border-gray-500 pb-1">
                Already have a membership? Login
             </Link>
        </div>

      </div>
    </div>
  );
}