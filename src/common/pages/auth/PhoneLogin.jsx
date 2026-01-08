import React, { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const PhoneLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  // 1. Setup Recaptcha (Required by Firebase)
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible", // or 'normal'
        callback: (response) => {
          // reCAPTCHA solved
        },
      });
    }
  };

  // 2. Send SMS
  const onSignInSubmit = async (e) => {
    e.preventDefault();
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    try {
      // Must be in E.164 format (e.g., +919876543210)
      const formattedPhone = `+91${phone}`; 
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      toast.success("OTP Sent!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send OTP");
    }
  };

  // 3. Verify OTP & Send to Backend
  const verifyOtp = async () => {
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user; // Firebase User
      const idToken = await user.getIdToken(); // Get the ID Token

      // Send to Django
      const res = await axios.post("http://127.0.0.1:8000/api/auth/firebase/", {
        id_token: idToken,
      });

      // Handle Success (Save tokens, redirect)
      localStorage.setItem("access_token", res.data.access);
      toast.success("Login Successful!");
      navigate("/");
      
    } catch (error) {
      console.error(error);
      toast.error("Invalid OTP or Backend Error");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Phone Login</h2>
      
      {!confirmationResult ? (
        <form onSubmit={onSignInSubmit} className="space-y-4">
          <input
            type="tel"
            placeholder="Enter Phone Number"
            className="w-full p-2 border rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {/* Recaptcha Container is REQUIRED */}
          <div id="recaptcha-container"></div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Send OTP
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full p-2 border rounded"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp} className="bg-green-600 text-white px-4 py-2 rounded">
            Verify & Login
          </button>
        </div>
      )}
    </div>
  );
};

export default PhoneLogin;