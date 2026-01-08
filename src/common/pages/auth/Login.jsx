import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Phone, Smartphone } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../../context/Authprovider";
import API from "../../../../api/Api";
import { toast } from "react-toastify";


// --- Visual Components ---
const GrainOverlay = () => (
  <div
    className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-multiply"
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
      toast.success("Welcome back.");
      navigate("/");
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
        toast.success("Google authentication successful.");
        navigate("/");
      } catch (err) {
        toast.error(err.response?.data?.error || "Google login failed");
      }
    },
    onError: () => toast.error("Google login failed"),
  });

  // 3. Firebase Phone Auth Logic
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
      });
    }
  };

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
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = `+91${phone}`; // Change +91 to your default country code if needed
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      toast.success(`OTP sent to ${formattedPhone}`);
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP. Try again.");
      toast.error("Failed to send OTP.");
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
      toast.success("Access Granted.");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Invalid OTP or Server Error.");
      toast.error("Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#050505] text-white flex overflow-hidden relative font-sans selection:bg-yellow-900 selection:text-white">
      <GrainOverlay />

      {/* LEFT SIDE: VISUAL */}
      <div className="hidden lg:block w-1/2 h-full relative overflow-hidden">
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

      {/* RIGHT SIDE: THE FORM */}
      <div className="w-full lg:w-1/2 h-full flex items-end justify-center p-8 pb-16 relative z-20">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-serif text-white mb-1">Access Vault</h2>
            <p className="text-gray-500 text-xs font-light">Select authentication method.</p>
          </div>

          {/* TOGGLE SWITCH (Email vs Phone) */}
          <div className="flex gap-4 mb-8 border-b border-gray-800 pb-2">
            <button 
                onClick={() => { setLoginMethod("email"); setError(""); }}
                className={`text-xs uppercase tracking-widest pb-2 transition-colors ${loginMethod === "email" ? "text-yellow-500 border-b border-yellow-500" : "text-gray-500 hover:text-white"}`}
            >
                Email Access
            </button>
            <button 
                onClick={() => { setLoginMethod("phone"); setError(""); }}
                className={`text-xs uppercase tracking-widest pb-2 transition-colors ${loginMethod === "phone" ? "text-yellow-500 border-b border-yellow-500" : "text-gray-500 hover:text-white"}`}
            >
                Mobile Access
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
                    className="space-y-5"
                >
                    <div className="group relative">
                    <Mail className="absolute left-0 top-2.5 text-gray-500 w-4 h-4 transition-colors group-focus-within:text-yellow-600" />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 transition-colors"
                    />
                    </div>

                    <div className="group relative">
                    <Lock className="absolute left-0 top-2.5 text-gray-500 w-4 h-4 transition-colors group-focus-within:text-yellow-600" />
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-8 pr-12 py-2 bg-transparent border-b border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 transition-colors"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-2.5 text-gray-500 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    </div>

                    {error && (
                        <div className="text-red-400 text-[10px] bg-red-900/10 border border-red-900/30 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-black py-3 rounded-sm uppercase text-[10px] font-bold tracking-widest hover:bg-yellow-600 hover:text-white transition-all duration-500 disabled:opacity-50"
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
                    className="space-y-5"
                >
                    {!confirmationResult ? (
                        // Step 1: Phone Input
                        <div className="group relative">
                            <Phone className="absolute left-0 top-2.5 text-gray-500 w-4 h-4 transition-colors group-focus-within:text-yellow-600" />
                            <div className="flex items-center w-full border-b border-gray-800 focus-within:border-yellow-600 transition-colors">
                                <span className="pl-8 py-2 text-sm text-gray-400 mr-2">+91</span>
                                <input
                                    type="tel"
                                    placeholder="Mobile Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    required
                                    className="flex-1 py-2 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
                                />
                            </div>
                            {/* REQUIRED for Firebase */}
                            <div id="recaptcha-container"></div>
                        </div>
                    ) : (
                        // Step 2: OTP Input
                        <div className="group relative">
                            <Smartphone className="absolute left-0 top-2.5 text-gray-500 w-4 h-4 transition-colors group-focus-within:text-yellow-600" />
                            <input
                                type="text"
                                placeholder="Enter Verification Code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 transition-colors"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="text-red-400 text-[10px] bg-red-900/10 border border-red-900/30 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-white text-black py-3 rounded-sm uppercase text-[10px] font-bold tracking-widest hover:bg-yellow-600 hover:text-white transition-all duration-500 disabled:opacity-50"
                    >
                        {isLoading ? "Processing..." : (confirmationResult ? "Verify & Access" : "Send Verification Code")}
                    </button>
                </motion.form>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <span className="relative bg-[#050505] px-2 text-[10px] text-gray-500 uppercase tracking-widest">or</span>
          </div>

          {/* GOOGLE BUTTON */}
          <button
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-sm border border-gray-800 bg-transparent text-gray-300 hover:border-yellow-600 hover:text-white transition-all duration-300 group"
          >
            <div className="opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">
               <GoogleIcon />
            </div>
            <span className="uppercase text-[10px] font-bold tracking-widest">
              Continue with Google
            </span>
          </button>

          <p className="mt-5 text-center text-xs text-gray-400">
            Not a member?{" "}
            <Link
              to="/signup"
              className="text-gray-200 hover:text-yellow-500 transition-colors border-b border-transparent hover:border-yellow-500 pb-0.5"
            >
              Request Access
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}