import axios from "axios";
import { ProductsApi } from "../data/ApiEndPoints";

export const GetProducts = async () => {
  try {
    const response = await axios.get(ProductsApi);
    return response.data; 
  } catch (err) {
    console.error("❌ Product fetch failed:", err.message);
    throw err; 
  }
};

