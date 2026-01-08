import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../common/context/Authprovider";
import { getOrders } from "../../api/orderservice";
import { toast } from "react-hot-toast";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Orders using the Helper Service
    const fetchUserOrders = async () => {
      try {
        setIsLoading(true);
        // This automatically adds the Token and uses the correct URL
        const data = await getOrders(); 
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Could not retrieve your collection.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatStatus = (status) => {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Hero Section */}
      <div className="relative bg-white py-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extralight tracking-tight text-gray-900 mb-4">
            Your Private Collection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A curated selection of your timeless acquisitions.
          </p>
          <div className="w-24 h-0.5 bg-gray-300 mx-auto mt-6"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-lg shadow-sm p-8">
            <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} className="h-20 w-20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-light text-gray-800 mb-3">
              Your collection awaits its first masterpiece.
            </h3>
            <p className="text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed">
              Explore our exquisite range of timepieces and begin building your legacy.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center justify-center px-10 py-3 border border-gray-900 text-sm font-medium tracking-wider uppercase text-gray-900 bg-white hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm"
            >
              Discover Watches
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-8">
            {orders.map((order) =>
              /* The backend nests product info inside `item.product`.
                 We map through items here to display individual cards.
              */
              order.items.map((item, index) => (
                <div
                  key={`${order.id}-${index}`}
                  className="bg-white p-8 rounded-lg shadow-lg flex flex-col lg:flex-row items-center transition-all duration-300 hover:shadow-xl"
                >
                  {/* Watch Image - Accessed via item.product.image */}
                  <div className="w-full lg:w-1/3 h-64 flex items-center justify-center bg-gray-50 rounded overflow-hidden mb-6 lg:mb-0 lg:mr-8 flex-shrink-0">
                    <img
                      src={item.product.image} 
                      alt={item.product.name}
                      className="h-full w-full object-contain transition-transform duration-500 hover:scale-110"
                    />
                  </div>

                  {/* Watch Details */}
                  <div className="w-full lg:w-2/3 flex flex-col">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div className="mb-6 md:mb-0">
                        <h3 className="text-2xl font-light text-gray-900 mb-2 leading-tight">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 uppercase tracking-wider">
                          Ref: <span className="font-semibold">{String(item.product.id).padStart(6, '0')}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Date</p>
                          {/* Use order.created_at instead of order.date */}
                          <p className="text-gray-900 font-medium">{formatDate(order.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Qty</p>
                          <p className="text-gray-900 font-medium">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Price</p>
                          {/* Item price is stored directly in OrderItem by backend */}
                          <p className="text-gray-800 font-medium">${Number(item.price).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Total</p>
                          <p className="text-gray-800 text-lg font-semibold">
                            ${(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Status */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-400">
                          Order ID: <span className="font-mono">#{order.id}</span>
                        </span>
                        <span className={`text-xs font-bold uppercase ${
                            order.status === 'delivered' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      
                      {/* Optional Certificate Link */}
                      <button
                        onClick={() => navigate("/certificate", { state: { item: item.product, date: order.created_at } })}
                        className="text-xs text-gray-900 hover:text-gray-600 uppercase tracking-widest flex items-center group transition-colors duration-300"
                      >
                        View Certificate
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Note */}
      {orders.length > 0 && (
        <div className="bg-gray-800 text-white py-16 mt-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-300 uppercase tracking-widest mb-3">
              Beyond Time, Beyond Measure
            </p>
            <p className="text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
              Each timepiece in your esteemed collection is a testament to precision, artistry, and a legacy that transcends generations. Cherish every moment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;