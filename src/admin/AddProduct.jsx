import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/Api"; 
import { toast } from "react-toastify";
import { Upload, X, ArrowLeft, Tag, Layers } from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    brand: "Rolex", // ✅ Added Brand with default
    description: "",
    price: "",
    stock: "",
    category: "men",
    video: "", 
  });
  
  // ✅ Brand Options (Must match Django Model)
  const BRAND_OPTIONS = [
    "Rolex",
    "Rado",
    "Patek Philippe",
    "Audemars Piguet",
    "Omega",
    "Cartier"
  ];

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Main Image Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  // Gallery Handlers
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
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
      data.append("video", formData.video);

      // Append Main Image
      if (imageFile) {
        data.append("image", imageFile);
      }

      // Append Gallery Images
      galleryFiles.forEach((file) => {
        data.append("gallery_images", file); 
      });

      await API.post("/products/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product added successfully!");
      navigate("/manageproducts");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center items-center">
      <div className="max-w-3xl w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 shadow-2xl">
        
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-yellow-500 font-serif">Add New Timepiece</h2>
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
                <ArrowLeft size={16}/> Back
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none" />
          </div>

          {/* Row 2: Brand & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ✅ Brand Selection */}
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

          {/* Row 3: Price & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Price (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Stock Quantity</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none" />
            </div>
          </div>

          {/* Video URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Video URL</label>
            <input 
              type="url" 
              name="video" 
              value={formData.video} 
              onChange={handleChange} 
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none" />
          </div>

          {/* Main Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Main Image</label>
            {!previewUrl ? (
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:border-yellow-500 hover:text-yellow-500 transition-colors cursor-pointer relative">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <Upload size={32} className="mb-2" />
                    <span className="text-sm">Click to upload main image</span>
                </div>
            ) : (
                <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-gray-600 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-red-600 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            )}
          </div>

          {/* Gallery Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Gallery Images</label>
            <div className="grid grid-cols-4 gap-4">
                {galleryPreviews.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-600">
                        <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeGalleryImage(index)} className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-red-600 transition-colors">
                            <X size={12} />
                        </button>
                    </div>
                ))}
                
                {/* Upload Button */}
                <label className="border-2 border-dashed border-gray-600 rounded-lg aspect-square flex flex-col items-center justify-center text-gray-500 hover:border-yellow-500 hover:text-yellow-500 cursor-pointer transition-colors relative">
                    <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <Upload size={24} />
                    <span className="text-xs mt-1">Add</span>
                </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-4 rounded-lg transition-all disabled:opacity-50 uppercase tracking-widest mt-6">
            {loading ? "Uploading to Cloud..." : "Add to Collection"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;