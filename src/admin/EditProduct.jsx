import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/Api"; 
import { toast } from "react-toastify";
import { Upload, ArrowLeft, Loader, Package, DollarSign, Tag, Layers, FileText } from "lucide-react";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    brand: "", // ✅ Added Brand field
    description: "",
    price: "",
    stock: "",
    category: "men",
  });
  
  const [existingImage, setExistingImage] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // ✅ Brand Options (Must match Django Model)
  const BRAND_OPTIONS = [
    "Rolex",
    "Rado",
    "Patek Philippe",
    "Audemars Piguet",
    "Omega",
    "Cartier"
  ];

  // 1. Fetch Existing Data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}/`);
        const data = res.data;
        
        setFormData({
            name: data.name,
            brand: data.brand || "Rolex", // ✅ Load existing brand or default
            description: data.description,
            price: data.price,
            stock: data.stock || 0,
            category: data.category || "men",
        });
        
        // Handle Image URL
        if (data.image) {
            setExistingImage(data.image.startsWith("http") ? data.image : `http://127.0.0.1:8000${data.image}`);
        }
        
        setFetching(false);
      } catch (error) {
        console.error("Fetch error", error);
        toast.error("Could not load product details.");
        navigate("/manageproducts");
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("brand", formData.brand); // ✅ Send Brand
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("category", formData.category);

      if (newImageFile) {
        data.append("image", newImageFile);
      }

      await API.patch(`/products/${id}/`, data, { // Changed to PATCH for partial updates if needed
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product updated successfully!");
      navigate("/manageproducts");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 flex justify-center items-center font-sans">
      <div className="max-w-4xl w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-yellow-500 font-serif tracking-tight">Edit Timepiece</h2>
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
                <ArrowLeft size={18}/> Back to Products
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Main Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Image */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-400">Product Image</label>
                <div className="relative group w-full aspect-square bg-gray-900 rounded-xl border-2 border-dashed border-gray-600 hover:border-yellow-500/50 transition-all overflow-hidden flex items-center justify-center cursor-pointer">
                    {previewUrl || existingImage ? (
                        <img 
                            src={previewUrl || existingImage} 
                            alt="Preview" 
                            className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" 
                        />
                    ) : (
                        <div className="text-center p-4">
                            <Upload className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Upload Image</p>
                        </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-black/70 text-white px-3 py-1 rounded text-sm flex items-center gap-2">
                            <Upload size={14} /> Change
                        </span>
                    </div>

                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
            </div>

            {/* Right Column: Details */}
            <div className="space-y-6">
                
                {/* Name */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-400 mb-2">
                        <Package className="w-4 h-4 mr-2 text-yellow-500" /> Name
                    </label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Brand Selection */}
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-400 mb-2">
                            <Tag className="w-4 h-4 mr-2 text-yellow-500" /> Brand
                        </label>
                        <div className="relative">
                            <select name="brand" value={formData.brand} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white appearance-none focus:border-yellow-500 focus:outline-none cursor-pointer">
                                {BRAND_OPTIONS.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-400 mb-2">
                            <Layers className="w-4 h-4 mr-2 text-yellow-500" /> Category
                        </label>
                        <div className="relative">
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white appearance-none focus:border-yellow-500 focus:outline-none cursor-pointer">
                                <option value="men">Men</option>
                                <option value="women">Women</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Price */}
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-400 mb-2">
                            <DollarSign className="w-4 h-4 mr-2 text-yellow-500" /> Price (₹)
                        </label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none" />
                    </div>
                    {/* Stock */}
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-400 mb-2">
                            <Layers className="w-4 h-4 mr-2 text-yellow-500" /> Stock
                        </label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none" />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-400 mb-2">
                        <FileText className="w-4 h-4 mr-2 text-yellow-500" /> Description
                    </label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none resize-none" />
                </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-700">
             <button type="button" onClick={() => navigate("/manageproducts")} className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Cancel
             </button>
             <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-3 rounded-lg transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 uppercase tracking-widest flex items-center justify-center gap-2">
                {loading ? <Loader className="animate-spin" size={20} /> : "Save Changes"}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProduct;