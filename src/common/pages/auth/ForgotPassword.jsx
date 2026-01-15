import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowLeft, Timer, Smartphone, CheckCircle, Loader2 } from "lucide-react";
import OtpInput from "react-otp-input";
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

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // Steps: 1=Email, 2=OTP, 3=NewPassword
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false); // Visual loader for OTP auto-check

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Timer State
  const [timer, setTimer] = useState(300); 
  const [canResend, setCanResend] = useState(false);

  // Timer Logic
  useEffect(() => {
    let interval;
    if (step >= 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? `0${sec}` : sec}`;
  };

  // --- LOGIC ---

  // Step 1: Send Email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await API.post("/auth/password-reset-request/", { email });
      setStep(2);
      setTimer(300);
      setCanResend(false);
      toast.success("Verification code sent.");
    } catch (err) {
      toast.error(err.response?.data?.email || "Account not found");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP Input & Auto-Verify
  const handleOtpChange = (code) => {
    setOtp(code);
    
    // Auto-advance logic when 6 digits are filled
    if (code.length === 6) {
      setIsVerifyingOtp(true);
      
      // UX Delay to let user see they finished typing
      setTimeout(() => {
        setIsVerifyingOtp(false);
        setStep(3); // Move to Password creation
      }, 800); 
    }
  };

  // Step 3: Final Reset
  const handleFinalReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // We send Email + OTP + Password all together here
      await API.post("/auth/password-reset-confirm/", {
        email,
        otp,
        new_password: newPassword,
      });
      toast.success("Password Reset Successfully!");
      navigate("/login");
    } catch (err) {
      // If error, it means OTP was wrong or Password too weak
      toast.error(err.response?.data?.non_field_errors || "Invalid Code or Weak Password");
      // Optional: Send them back to Step 2 if OTP was wrong
      if (err.response?.data?.non_field_errors?.[0]?.includes("OTP")) {
          setStep(2);
          setOtp("");
      }
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
          src="https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=2565&auto=format&fit=crop"
          alt="Clock Mechanism"
          className="w-full h-full object-cover grayscale opacity-80"
        />
        <div className="absolute bottom-12 left-12 z-20">
          <h1 className="text-3xl font-serif text-white mb-2">Recovery.</h1>
          <p className="text-yellow-500 text-xs tracking-[0.3em] uppercase">
            Secure Access • Protocol
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8">
            <Link to="/login" className="flex items-center text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
            </Link>
            
            <h2 className="text-2xl font-serif text-white mb-1">
              {step === 1 && "Forgot Password?"}
              {step === 2 && "Verification"}
              {step === 3 && "Secure New Password"}
            </h2>
            
            <p className="text-gray-500 text-xs font-light">
              {step === 1 && "Enter your email to receive a recovery code."}
              {step === 2 && `Enter the 6-digit code sent to ${email}`}
              {step === 3 && "Create a strong password to secure your account."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            
            {/* STEP 1: EMAIL */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRequestOtp}
                className="space-y-6"
              >
                <div className="group relative">
                  <Mail className="absolute left-0 top-2.5 text-gray-500 w-4 h-4 transition-colors group-focus-within:text-yellow-600" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black py-3 rounded-sm uppercase text-[10px] font-bold tracking-widest hover:bg-yellow-600 hover:text-white transition-all duration-500 disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Send Recovery Code"}
                </button>
              </motion.form>
            )}

            {/* STEP 2: OTP (AUTO VERIFY) */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-center relative">
                  <OtpInput
                    value={otp}
                    onChange={handleOtpChange}
                    numInputs={6}
                    renderInput={(props) => <input {...props} />}
                    containerStyle={{ gap: "8px", justifyContent: "center" }}
                    inputStyle={{
                      width: "45px",
                      height: "55px",
                      fontSize: "24px",
                      backgroundColor: "transparent",
                      borderBottom: "1px solid #333",
                      borderTop: "none",
                      borderLeft: "none",
                      borderRight: "none",
                      color: "white",
                      outline: "none",
                      textAlign: "center",
                      fontFamily: "serif"
                    }}
                    focusStyle={{
                      borderBottom: "1px solid #ca8a04", // yellow-600
                    }}
                    shouldAutoFocus={true}
                  />
                  
                  {/* Visual Loading Overlay when verifying */}
                  {isVerifyingOtp && (
                    <div className="absolute inset-0 bg-[#050505]/80 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                  <div className="flex items-center gap-2">
                    <Timer className="w-3 h-3" />
                    <span>Expires in {formatTime(timer)}</span>
                  </div>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="text-white hover:text-yellow-500 transition-colors uppercase tracking-wider font-semibold"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span className="opacity-50 uppercase tracking-wider">Wait to resend</span>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleFinalReset}
                className="space-y-6"
              >
                {/* Visual confirmation that OTP is 'done' */}
                <div className="flex items-center justify-center gap-2 mb-4 text-green-500 text-xs uppercase tracking-widest">
                    <CheckCircle className="w-4 h-4" />
                    <span>Code Verified</span>
                </div>

                <div className="group relative">
                  <Lock className="absolute left-0 top-2.5 text-gray-500 w-4 h-4 transition-colors group-focus-within:text-yellow-600" />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black py-3 rounded-sm uppercase text-[10px] font-bold tracking-widest hover:bg-yellow-600 hover:text-white transition-all duration-500 disabled:opacity-50"
                >
                  {isLoading ? "Updating Vault..." : "Confirm New Password"}
                </button>
              </motion.form>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}