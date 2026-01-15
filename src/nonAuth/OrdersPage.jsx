import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../common/context/Authprovider";
import API from "../../api/Api";
import { toast } from "react-hot-toast";
import {
  XCircle,
  FileText,
  ChevronRight,
  Calendar,
  CreditCard,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  ArrowLeft,
  RefreshCw,
  Watch,
  Shield
} from "lucide-react";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch Orders
  const fetchUserOrders = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/orders/my-orders/"); 
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Could not retrieve your collection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  // Handle Cancellation
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you wish to cancel this acquisition?")) return;

    try {
      await API.post(`/orders/${orderId}/cancel/`);
      toast.success("Order cancelled successfully.");
      fetchUserOrders();
    } catch (error) {
      console.error("Cancel error", error);
      toast.error(error.response?.data?.error || "Could not cancel order.");
    }
  };

  // Status style helper
  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "pending": return "bg-amber-100 text-amber-800 border-amber-200";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "delivered": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled": return "bg-rose-100 text-rose-800 border-rose-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "processing": return <Package className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-gray-50 to-white py-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extralight tracking-tight text-gray-900 mb-4">
              Your Private Collection
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              A curated selection of your timeless acquisitions.
            </p>
            <div className="w-24 h-0.5 bg-gray-300 mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-light text-gray-800">
              Your Acquisitions
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {orders.length} timepiece{orders.length !== 1 ? 's' : ''} in your collection
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={fetchUserOrders}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-all flex items-center gap-2"
            >
              <Watch className="w-4 h-4" />
              Explore Collection
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-sm p-12 border border-gray-100">
            <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center text-gray-300">
              <Watch className="h-20 w-20" />
            </div>
            <h3 className="text-2xl font-light text-gray-800 mb-4">
              Your collection awaits its first masterpiece.
            </h3>
            <p className="text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed text-lg">
              Explore our exquisite range of timepieces and begin building your legacy.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center justify-center px-12 py-4 border-2 border-gray-900 text-base font-medium tracking-wider uppercase text-gray-900 bg-white hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm group"
            >
              Discover Watches
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          /* Orders List - Display items individually */
          <div className="space-y-8">
            {orders.flatMap(order => 
              order.items.map((item, index) => (
                <div
                  key={`${order.id}-${index}`}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Order Header */}
                  <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Order Date</p>
                            <p className="text-sm font-medium text-gray-900">{formatDate(order.created_at)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Order ID</p>
                            <p className="text-sm font-medium text-gray-900">#{order.id}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full border ${getStatusStyle(order.status)}`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Watch Details */}
                  <div className="p-8 flex flex-col lg:flex-row gap-8">
                    {/* Watch Image */}
                    <div className="lg:w-1/3">
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-contain p-8 transition-transform duration-500 hover:scale-105"
                          />
                        ) : (
                          <Watch className="w-20 h-20 text-gray-300" />
                        )}
                      </div>
                    </div>

                    {/* Watch Details */}
                    <div className="lg:w-2/3">
                      <div className="mb-8">
                        <h3 className="text-2xl font-light text-gray-900 mb-2 leading-tight">
                          {item.product?.name || item.product_name}
                        </h3>
                        <p className="text-sm text-gray-500 uppercase tracking-wider mb-6">
                          Reference: <span className="font-semibold text-gray-900">
                            {String(item.product?.id || '000000').padStart(6, '0')}
                          </span>
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Quantity</p>
                            <p className="text-lg font-medium text-gray-900">{item.quantity}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Unit Price</p>
                            <p className="text-lg font-medium text-gray-900">₹{Number(item.price).toLocaleString()}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Item Total</p>
                            <p className="text-2xl font-light text-gray-900">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Order Total</p>
                            <p className="text-2xl font-light text-gray-900 font-serif">
                              ₹{Number(order.total_price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                        <button
                          onClick={() => navigate("/certificate", {
                            state: {
                              item: item.product,
                              date: order.created_at,
                              orderId: order.id
                            }
                          })}
                          className="px-6 py-3 border border-yellow-600 text-yellow-700 text-sm font-medium rounded-lg hover:bg-yellow-50 transition-all flex items-center gap-2 group"
                        >
                          <FileText className="w-4 h-4" />
                          View Certificate
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-6 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Order Details
                        </button>

                        {['pending', 'processing'].includes(order.status?.toLowerCase()) && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-6 py-3 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition-all flex items-center gap-2 ml-auto"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel Order
                          </button>
                        )}
                      </div>
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
        <div className="bg-gradient-to-b from-white to-gray-50 py-16 mt-12 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-100">
              <Watch className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400 uppercase tracking-[0.2em] mb-4">
              Horologie Maison
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-serif italic">
              "Each timepiece in your collection is a testament to precision, artistry, and a legacy that transcends generations."
            </p>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-gray-200">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-light text-gray-900 mb-2">Order #{selectedOrder.id}</h3>
                <p className="text-gray-500">
                  Placed on {formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 uppercase tracking-wider">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedOrder.status)}
                    <span className={`text-sm px-3 py-1.5 rounded-full border ${getStatusStyle(selectedOrder.status)}`}>
                      {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500 uppercase tracking-wider">Payment</p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {selectedOrder.payment_status || 'Completed'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Order Items</p>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200">
                          {item.product?.image ? (
                            <img 
                              src={item.product.image} 
                              alt={item.product_name} 
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <Watch className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-gray-900">
                        ₹{Number(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">₹{Number(selectedOrder.total_price).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-gray-900">₹0</span>
                  </div>
                  <div className="flex justify-between text-lg font-light pt-3 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900 font-serif">
                      ₹{Number(selectedOrder.total_price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Print functionality
                  window.print();
                }}
                className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;