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

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col lg:flex-row overflow-hidden relative font-sans selection:bg-yellow-900 selection:text-white">
      <GrainOverlay />

      {/* TOP BAR FOR MOBILE */}
      <div className="lg:hidden w-full p-4 flex items-center justify-between border-b border-gray-900 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <Watch className="w-5 h-5 text-yellow-500" />
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

      {/* LEFT SIDE: VISUAL - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=2574&auto=format&fit=crop"
          alt="Watch Movement"
          className="w-full h-full object-cover grayscale opacity-80"
        />
        <div className="absolute bottom-12 left-12 z-20">
          <h1 className="text-3xl font-serif text-white mb-2">Horologie.</h1>
          <p className="text-yellow-500 text-xs tracking-[0.3em] uppercase">
            Est. 1924 • Geneva
          </p>
        </div>
      </div>

      {/* MOBILE BACKGROUND IMAGE */}
      <div className="lg:hidden absolute inset-0 z-0 opacity-20">
        <img
          src="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=600&auto=format&fit=crop"
          alt="Watch Movement"
          className="w-full h-full object-cover grayscale"
        />
      </div>

      {/* RIGHT SIDE: THE FORM */}
      <div className="w-full lg:w-1/2 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-20">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md bg-black/80 backdrop-blur-sm border border-gray-900 rounded-2xl p-6 sm:p-8"
        >
          {/* Back button for OTP verification */}
          {showBackButton && (
            <button
              onClick={handleBackToPhoneInput}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to phone input
            </button>
          )}

          <div className="mb-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-serif text-white mb-1">Access Vault</h2>
            <p className="text-gray-500 text-xs sm:text-sm font-light">Select authentication method</p>
          </div>

          {/* TOGGLE SWITCH (Email vs Phone) - Better mobile layout */}
          <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8 border-b border-gray-800 pb-2">
            <button 
                onClick={() => { 
                  setLoginMethod("email"); 
                  setError("");
                  setShowBackButton(false);
                }}
                className={`flex-1 text-xs sm:text-sm uppercase tracking-wider pb-2 transition-colors text-center ${loginMethod === "email" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-500 hover:text-white"}`}
            >
                <span className="hidden sm:inline">Email</span>
                <span className="sm:hidden">Email</span>
            </button>
            <button 
                onClick={() => { 
                  setLoginMethod("phone"); 
                  setError("");
                  setShowBackButton(false);
                }}
                className={`flex-1 text-xs sm:text-sm uppercase tracking-wider pb-2 transition-colors text-center ${loginMethod === "phone" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-500 hover:text-white"}`}
            >
                <span className="hidden sm:inline">Mobile</span>
                <span className="sm:hidden">Phone</span>
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
                    <Mail className="absolute left-3 top-3 sm:top-2.5 text-gray-500 w-4 h-4 sm:w-4 sm:h-4 transition-colors group-focus-within:text-yellow-600" />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 sm:pl-8 pr-4 py-3 sm:py-2 bg-gray-900/50 border border-gray-800 text-sm sm:text-base text-white placeholder-gray-500 rounded-lg focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600/20 transition-all"
                    />
                    </div>

                    <div className="group relative">
                    <Lock className="absolute left-3 top-3 sm:top-2.5 text-gray-500 w-4 h-4 sm:w-4 sm:h-4 transition-colors group-focus-within:text-yellow-600" />
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 sm:pl-8 pr-12 py-3 sm:py-2 bg-gray-900/50 border border-gray-800 text-sm sm:text-base text-white placeholder-gray-500 rounded-lg focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600/20 transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 sm:top-2.5 text-gray-500 hover:text-white transition-colors p-1"
                    >
                        {showPassword ? <EyeOff size={18} className="sm:w-4 sm:h-4" /> : <Eye size={18} className="sm:w-4 sm:h-4" />}
                    </button>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex justify-end -mt-1">
                      <Link 
                        to="/forgot-password" 
                        className="text-xs sm:text-[10px] text-gray-500 hover:text-yellow-500 transition-colors tracking-wide uppercase"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs sm:text-[10px] bg-red-900/10 border border-red-900/30 p-3 sm:p-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-black py-3 sm:py-3 rounded-lg uppercase text-xs sm:text-[10px] font-bold tracking-widest hover:bg-yellow-600 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {isLoading ? "Authenticating..." : "Unlock Vault"}
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
                            <div className="flex items-center w-full bg-gray-900/50 border border-gray-800 rounded-lg focus-within:border-yellow-600 focus-within:ring-1 focus-within:ring-yellow-600/20 transition-all">
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
                            <Smartphone className="absolute left-3 top-3 text-gray-500 w-4 h-4 transition-colors group-focus-within:text-yellow-600" />
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 text-sm sm:text-base text-white placeholder-gray-500 rounded-lg focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600/20 transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code sent to your phone</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-400 text-xs sm:text-[10px] bg-red-900/10 border border-red-900/30 p-3 sm:p-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-white text-black py-3 sm:py-3 rounded-lg uppercase text-xs sm:text-[10px] font-bold tracking-widest hover:bg-yellow-600 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-800 bg-gray-900/50 text-gray-300 hover:border-yellow-600 hover:text-white hover:bg-gray-800/30 transition-all duration-300 group"
          >
            <div className="opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">
               <GoogleIcon />
            </div>
            <span className="uppercase text-xs sm:text-[10px] font-bold tracking-widest">
              Continue with Google
            </span>
          </button>

          <p className="mt-6 text-center text-xs sm:text-sm text-gray-400">
            Not a member?{" "}
            <Link
              to="/signup"
              className="text-gray-200 hover:text-yellow-500 transition-colors border-b border-transparent hover:border-yellow-500 pb-0.5"
            >
              Request Access
            </Link>
          </p>

          {/* Mobile Footer */}
          <div className="mt-8 pt-6 border-t border-gray-900 text-center lg:hidden">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">
              © 2024 Horologie. All Rights Reserved
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}