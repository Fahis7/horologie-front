import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Phone, Smartphone, ArrowLeft, Watch } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../../context/Authprovider";
import API from "../../../../api/Api";
import { toast } from "react-toastify";

// Firebase Imports
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../../firebaseConfig"; 

// --- Visual Components ---
const GrainOverlay = () => (
  <div
    className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-multiply"
    style={{
      backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")`,
    }}
  />
);

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#757575" />
    <path d="M12.24 24.0008C15.4765 24.0008 18.2058 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z" fill="#757575" />
    <path d="M5.50253 14.3003C5.00236 12.8199 5.00236 11.1799 5.50253 9.69951V6.60861H1.5166C-0.18551 10.0056 -0.18551 13.9945 1.5166 17.3915L5.50253 14.3003Z" fill="#757575" />
    <path d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.0344664 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.60861L5.50253 9.69951C6.45064 6.85986 9.10935 4.74966 12.24 4.74966Z" fill="#757575" />
  </svg>
);

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Standard Login States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // OTP Login States
  const [loginMethod, setLoginMethod] = useState("email"); // 'email' or 'phone'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [showBackButton, setShowBackButton] = useState(false);

  // Use a Ref to track if recaptcha is already rendered to avoid duplicate widgets
  const recaptchaVerifierRef = useRef(null);

  // --- Helper Function for Redirection ---
  const handleRedirect = (userData) => {
    if (userData.is_staff || userData.is_superuser) {
      toast.info("Admin Access Granted");
      navigate("/admin");
    } else {
      toast.success("Welcome back.");
      navigate("/");
    }
  };

  // --- Handlers ---

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Email/Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await API.post("/auth/login/", formData);
      login(res.data);
      
      // ✅ Role Check
      handleRedirect(res.data.user);

    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || "Authentication failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Google Login
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await API.post("/auth/google/", {
          token: tokenResponse.access_token,
        });
        login(res.data);
        
        // ✅ Role Check
        handleRedirect(res.data.user);

      } catch (err) {
        toast.error(err.response?.data?.error || "Google login failed");
      }
    },
    onError: () => toast.error("Google login failed"),
  });

  // 3. Firebase Phone Auth Logic
  
  // ✅ FIX: Only initialize Recaptcha when 'phone' mode is active AND element exists
  useEffect(() => {
    let verifier = null;

    if (loginMethod === "phone") {
      // Small timeout to ensure the DOM element is rendered by React first
      const timer = setTimeout(() => {
        const container = document.getElementById("recaptcha-container");
        
        if (container && !recaptchaVerifierRef.current) {
          try {
            verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
              size: "invisible",
              callback: (response) => {
                // reCAPTCHA solved
                console.log("Recaptcha verified");
              },
              "expired-callback": () => {
                console.log("Recaptcha expired");
              }
            });
            recaptchaVerifierRef.current = verifier;
            window.recaptchaVerifier = verifier;
          } catch (err) {
            console.error("Recaptcha Init Error:", err);
          }
        }
      }, 500); // 500ms delay to wait for animation
      return () => clearTimeout(timer);
    } else {
      // If switching back to email, we can optionally clear the verifier
      if (recaptchaVerifierRef.current) {
        try {
            recaptchaVerifierRef.current.clear();
        } catch(e) { /* ignore */ }
        recaptchaVerifierRef.current = null;
        window.recaptchaVerifier = null;
      }
    }
  }, [loginMethod]); // Re-run when tab changes

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number.");
      setIsLoading(false);
      return;
    }

    try {
      const appVerifier = window.recaptchaVerifier;
      
      // Safety check
      if (!appVerifier) {
        setError("Please refresh the page and try again.");
        return;
      }

      const formattedPhone = `+91${phone}`; 
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setShowBackButton(true);
      toast.success(`OTP sent to ${formattedPhone}`);
    } catch (err) {
      console.error("Firebase Error:", err);
      
      if (err.code === 'auth/billing-not-enabled') {
         setError("Quota Exceeded. Use Test Number: 1234567890");
      } else if (err.code === 'auth/invalid-phone-number') {
         setError("Invalid Phone Number");
      } else {
         setError("Failed to send OTP. Try again.");
      }
      toast.error("Failed to send OTP.");
      
      // Reset captcha on error so user can try again
      if(window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          recaptchaVerifierRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Verify with Firebase
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const idToken = await user.getIdToken();

      // 2. Send ID Token to Django
      const res = await API.post("/auth/firebase/", {
        id_token: idToken,
      });

      // 3. Login User
      login(res.data);
      
      // ✅ Role Check
      handleRedirect(res.data.user);

    } catch (err) {
      console.error(err);
      setError("Invalid OTP or Server Error.");
      toast.error("Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhoneInput = () => {
    setConfirmationResult(null);
    setOtp("");
    setShowBackButton(false);
    setError("");
  };

  // Shared form content for both mobile and desktop
  const renderForm = () => (
    <>
      {/* TOGGLE SWITCH (Email vs Phone) */}
      <div className="flex gap-1 mb-6 sm:mb-8 p-1 bg-gradient-to-b from-amber-950/20 to-amber-950/10 rounded-xl border border-amber-900/20 backdrop-blur-sm">
        <button 
          onClick={() => { 
            setLoginMethod("email"); 
            setError("");
            setShowBackButton(false);
          }}
          className={`flex-1 py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm ${loginMethod === "email" 
            ? "bg-gradient-to-b from-amber-900/30 to-amber-950/30 text-amber-300 border border-amber-700/30" 
            : "text-gray-400 hover:text-white hover:bg-white/5"}`}
        >
          Email
        </button>
        <button 
          onClick={() => { 
            setLoginMethod("phone"); 
            setError("");
            setShowBackButton(false);
          }}
          className={`flex-1 py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm ${loginMethod === "phone" 
            ? "bg-gradient-to-b from-amber-900/30 to-amber-950/30 text-amber-300 border border-amber-700/30" 
            : "text-gray-400 hover:text-white hover:bg-white/5"}`}
        >
          Mobile
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loginMethod === "email" ? (
          // === EMAIL LOGIN FORM ===
          <motion.form 
            key="email-form"
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleEmailLogin} 
            className="space-y-4 sm:space-y-5"
          >
            <div className="group relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-4 sm:h-4 transition-colors group-focus-within:text-amber-600" />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 sm:pl-10 pr-4 py-3 sm:py-3 bg-gray-900/50 border border-gray-800 text-sm sm:text-base text-white placeholder-gray-500 rounded-lg focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/20 transition-all"
              />
            </div>

            <div className="group relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-4 sm:h-4 transition-colors group-focus-within:text-amber-600" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 sm:pl-10 pr-12 py-3 sm:py-3 bg-gray-900/50 border border-gray-800 text-sm sm:text-base text-white placeholder-gray-500 rounded-lg focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} className="sm:w-4 sm:h-4" /> : <Eye size={18} className="sm:w-4 sm:h-4" />}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end -mt-1">
              <Link 
                to="/forgot-password" 
                className="text-xs sm:text-xs text-gray-500 hover:text-amber-500 transition-colors tracking-wide uppercase"
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div className="text-red-400 text-xs sm:text-xs bg-red-900/10 border border-red-900/30 p-3 sm:p-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black py-3 sm:py-3 rounded-lg uppercase text-xs sm:text-xs font-bold tracking-widest hover:bg-amber-600 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Authenticating..." : "Unlock Access"}
            </button>
          </motion.form>
        ) : (
          // === PHONE / OTP LOGIN FORM ===
          <motion.form 
            key="phone-form"
            initial={{ opacity: 0, x: 10 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -10 }}
            onSubmit={confirmationResult ? handleVerifyOtp : handleSendOtp} 
            className="space-y-4 sm:space-y-5"
          >
            {!confirmationResult ? (
              // Step 1: Phone Input
              <div className="group">
                <div className="flex items-center w-full bg-gray-900/50 border border-gray-800 rounded-lg focus-within:border-amber-600 focus-within:ring-1 focus-within:ring-amber-600/20 transition-all">
                  <div className="pl-4 pr-2 py-3 text-sm text-gray-400 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    className="flex-1 py-3 bg-transparent text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
                {/* REQUIRED for Firebase - Must exist when useEffect runs */}
                <div id="recaptcha-container" className="hidden"></div>
              </div>
            ) : (
              // Step 2: OTP Input
              <div className="group relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 transition-colors group-focus-within:text-amber-600" />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 text-sm sm:text-base text-white placeholder-gray-500 rounded-lg focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/20 transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code sent to your phone</p>
              </div>
            )}

            {error && (
              <div className="text-red-400 text-xs sm:text-xs bg-red-900/10 border border-red-900/30 p-3 sm:p-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black py-3 sm:py-3 rounded-lg uppercase text-xs sm:text-xs font-bold tracking-widest hover:bg-amber-600 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : (confirmationResult ? "Verify & Access" : "Send OTP")}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800"></div>
        </div>
        <span className="relative bg-black/80 px-3 text-xs text-gray-500 uppercase tracking-widest">or</span>
      </div>

      {/* GOOGLE BUTTON */}
      <button
        onClick={() => googleLogin()}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-800 bg-gray-900/50 text-gray-300 hover:border-amber-600 hover:text-white hover:bg-gray-800/30 transition-all duration-300 group"
      >
        <div className="opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">
          <GoogleIcon />
        </div>
        <span className="uppercase text-xs sm:text-xs font-bold tracking-widest">
          Continue with Google
        </span>
      </button>

      <p className="mt-6 text-center text-xs sm:text-sm text-gray-400">
        Not a member?{" "}
        <Link
          to="/signup"
          className="text-gray-200 hover:text-amber-500 transition-colors border-b border-transparent hover:border-amber-500 pb-0.5"
        >
          Request Access
        </Link>
      </p>
    </>
  );

  return (
    <>
      {/* MOBILE VIEW */}
      <div className="lg:hidden min-h-screen bg-[#050505] text-white flex flex-col overflow-hidden relative font-sans selection:bg-amber-900 selection:text-white">
        <GrainOverlay />

        {/* TOP BAR FOR MOBILE */}
        <div className="w-full p-4 flex items-center justify-between border-b border-gray-900 z-30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Watch className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-lg font-serif text-white">Horologie</h1>
              <p className="text-amber-500 text-[10px] tracking-[0.2em] uppercase">
                Est. 1924
              </p>
            </div>
          </div>
          <Link 
            to="/"
            className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 border border-gray-800 rounded-full"
          >
            Home
          </Link>
        </div>

        {/* Back button for OTP verification */}
        {showBackButton && (
          <button
            onClick={handleBackToPhoneInput}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white px-4 pt-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to phone input
          </button>
        )}

        {/* MOBILE FORM CONTENT */}
        <div className="flex-1 flex items-center justify-center p-4 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-serif text-white mb-1">Secure Access</h2>
              <p className="text-gray-500 text-sm font-light">Welcome to our private collection</p>
            </div>

            <div className="bg-black/80 backdrop-blur-sm border border-gray-900 rounded-2xl p-6">
              {renderForm()}
            </div>
          </motion.div>
        </div>

        {/* Mobile Footer */}
        <div className="mt-8 pt-6 border-t border-gray-900 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">
            © 2024 Horologie. All Rights Reserved
          </p>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:flex h-screen w-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] text-white overflow-hidden relative font-serif selection:bg-amber-900/30 selection:text-amber-100">
        <GrainOverlay />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Luxury Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/diamond-upholstery.png")`,
            backgroundSize: '300px'
          }} />
          
          {/* Shimmer Effect */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-amber-400/5 via-transparent to-transparent rounded-full blur-3xl" />
        </div>

        {/* LEFT SIDE: LUXURY VISUAL */}
        <div className="w-1/2 h-full relative overflow-hidden">
          {/* Luxury Gradient Overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black via-transparent to-transparent" />
          
          <motion.img
            initial={{ scale: 1.2 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 20, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1548169874-53e85f753f1e?q=80&w=2664&auto=format&fit=crop&ixlib=rb-4.0.3"
            alt="Luxury Watch Collection"
            className="w-full h-full object-cover"
          />
          
          <div className="absolute bottom-16 left-16 z-20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-amber-500 to-transparent"></div>
              <p className="text-amber-400 text-xs tracking-[0.4em] uppercase">
                Est. 1924
              </p>
            </div>
            <h1 className="text-5xl font-serif text-white mb-3 leading-tight">
              Timeless<br />Elegance
            </h1>
            <p className="text-gray-300/80 text-sm max-w-md leading-relaxed">
              Where centuries of horological mastery meet modern luxury. 
              Each timepiece tells a story of precision and passion.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: THE FORM */}
        <div className="w-1/2 h-full flex items-center justify-center p-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="relative">
              {/* Luxury Decorative Elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 border-t border-l border-amber-700/30"></div>
              <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b border-r border-amber-700/30"></div>
              
              <div className="backdrop-blur-xl bg-gradient-to-br from-black/80 via-[#0a0a0a]/90 to-[#111111]/90 border border-amber-900/20 rounded-2xl p-8 shadow-2xl shadow-black/40">
                
                {/* Back button for OTP verification */}
                {showBackButton && (
                  <button
                    onClick={handleBackToPhoneInput}
                    className="flex items-center gap-2 text-xs text-amber-300/60 hover:text-amber-300 mb-8 transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Return to phone verification
                  </button>
                )}

                {/* Header */}
                <div className="mb-10 text-center relative">
                  <div className="inline-flex items-center justify-center gap-3 mb-4">
                    <div className="w-5 h-5 text-amber-400">🔒</div>
                    <h2 className="text-3xl font-serif text-white tracking-wide">Secure Access</h2>
                  </div>
                  <p className="text-gray-400/80 text-sm font-light tracking-wide">
                    Welcome to our private collection
                  </p>
                  <div className="mt-6 flex justify-center">
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                  </div>
                </div>

                {renderForm()}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}