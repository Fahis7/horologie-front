// src/api/orderService.js
import API from './Api'; // Import your existing configured Axios instance

// 1. Initialize Payment (Get Secret from Stripe)
export const createPaymentIntent = async () => {
  const res = await API.post("/orders/create-payment-intent/");
  return res.data; 
};

// 2. Save Order (Send Address + Payment ID to Backend)
export const createOrder = async (orderData) => {
  const res = await API.post("/orders/create/", orderData);
  return res.data;
};

// 3. Get History (For the 'My Orders' page later)
export const getOrders = async () => {
  const res = await API.get("/orders/");
  return res.data;
};