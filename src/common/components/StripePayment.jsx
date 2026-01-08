import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

import { createOrder } from "../../../api/orderservice";
import { toast } from "react-hot-toast";

const StripePayment = ({ formData, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    // 🛑 VALIDATION
    const { full_name, address, city, state, zip_code, phone } = formData;
    if (!full_name || !address || !city || !state || !zip_code || !phone) {
        toast.error("Please fill in all shipping details.");
        return; 
    }

    setLoading(true);

    // 1. CONFIRM PAYMENT
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      toast.error(error.message); 
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      
      // 2. SAVE ORDER TO BACKEND
      try {
        const orderData = {
            full_name, address, city, state, zip_code, phone,
            payment_id: paymentIntent.id
        };

        // Call the API
        const newOrder = await createOrder(orderData);
        
        // ✅ PASS DATA UP: Send the actual order object to the parent
        onSuccess(newOrder); 
        
      } catch (err) {
        console.error("DB Save Failed", err);
        // Show specific backend error if available
        const msg = err.response?.data?.detail || "Order save failed.";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded-lg bg-gray-50">
      <PaymentElement />
      {errorMessage && <div className="text-red-500 text-sm mt-2">{errorMessage}</div>}
      <button
        disabled={!stripe || loading}
        className="w-full mt-6 bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {loading ? "Processing Securely..." : "Pay Now"}
      </button>
    </form>
  );
};

export default StripePayment;