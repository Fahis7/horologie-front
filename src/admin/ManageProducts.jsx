import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    image: "",
    price: "",
    description: "",
    in_stock: true,
    movement: "",
    color: "",
    gallery: ["", ""],
    video: "",
    water_resistance: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filterBrand, setFilterBrand] = useState("all");
  const [sortOption, setSortOption] = useState("price-asc");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("https://horologie-live-2.onrender.com/products");
      setProducts(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Error fetching products", err);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let temp = [...products];
    
    // Apply search filter
    if (searchTerm) {
      temp = temp.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply brand filter
    if (filterBrand !== "all") {
      temp = temp.filter(p => p.brand === filterBrand);
    }
    
    // Apply sorting
    temp.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'brand-asc': return a.brand.localeCompare(b.brand);
        case 'brand-desc': return b.brand.localeCompare(a.brand);
        default: return 0;
      }
    });
    
    setFiltered(temp);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, products, filterBrand, sortOption]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        image: product.image,
        price: product.price,
        description: product.description,
        in_stock: product.in_stock !== undefined ? product.in_stock : true,
        movement: product.movement || "",
        color: product.color || "",
        gallery: product.gallery || ["", ""],
        video: product.video || "",
        water_resistance: product.water_resistance || ""
      });
    } else {
      setFormData({
        name: "",
        brand: "",
        image: "",
        price: "",
        description: "",
        in_stock: true,
        movement: "",
        color: "",
        gallery: ["", ""],
        video: "",
        water_resistance: ""
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleGalleryChange = (index, value) => {
    const newGallery = [...formData.gallery];
    newGallery[index] = value;
    setFormData({
      ...formData,
      gallery: newGallery
    });
  };

  const addGalleryField = () => {
    setFormData({
      ...formData,
      gallery: [...formData.gallery, '']
    });
  };

  const removeGalleryField = (index) => {
    const newGallery = formData.gallery.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      gallery: newGallery
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`https://horologie-live-2.onrender.com/products/${editingProduct.id}`, formData);
        toast.success("Product updated successfully");
      } else {
        await axios.post("https://horologie-live-2.onrender.com/products", {
          ...formData,
          id: `prod-${Date.now()}` // Generate unique ID
        });
        toast.success("Product added successfully");
      }
      fetchProducts();
      closeModal();
    } catch (err) {
      console.error("Error saving product", err);
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`https://horologie-live-2.onrender.com/products/${id}`);
      fetchProducts();
      toast.success("Product deleted successfully");
    } catch (err) {
      console.error("Error deleting product", err);
      toast.error("Failed to delete product");
    }
  };

  // Get unique brands for filter
  const brands = [...new Set(products.map(product => product.brand))];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-400 mb-4"></div>
          <p className="text-gold-400 text-lg font-light">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white">Product Management</h1>
              <p className="text-gray-400 mt-2">
                -Administer system products and inventory-
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl shadow-sm p-6 mb-8 border border-gray-700/50 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2.5 w-full border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 text-gray-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="border border-gray-700 px-4 py-2.5 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 appearance-none text-gray-100 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiZxdW90O2N1cnJlbnRDb2xvciZxdW90OyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_0.75rem] bg-[length:1.5rem] backdrop-blur-sm"
            >
              <option value="all">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-700 px-4 py-2.5 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 appearance-none text-gray-100 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiZxdW90O2N1cnJlbnRDb2xvciZxdW90OyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_0.75rem] bg-[length:1.5rem] backdrop-blur-sm"
            >
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="brand-asc">Brand (A-Z)</option>
              <option value="brand-desc">Brand (Z-A)</option>
            </select>
            
            <button
              onClick={() => openModal()}
              className="px-4 py-2.5 bg-gold-500 text-gray-900 font-medium rounded-lg hover:bg-gold-400 transition-colors duration-200"
            >
              + Add Product
            </button>
          </div>
        </div>
        
        {/* Items per page selector */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-700 px-3 py-1 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 text-gray-100 text-sm"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <div className="text-sm text-gray-400">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filtered.length)} of {filtered.length} products
          </div>
        </div>
        
        {/* Product Table */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl shadow border border-gray-700/50 overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Brand
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800/30 divide-y divide-gray-700/50">
                {currentItems.length > 0 ? (
                  currentItems.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-700/20 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md overflow-hidden bg-gray-700">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-gold-400 font-medium">
                                {product.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-100">{product.name}</div>
                            <div className="text-xs text-gray-400 truncate max-w-xs">{product.description.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {product.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gold-400">
                        ${product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                          product.in_stock 
                            ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700' 
                            : 'bg-rose-900/30 text-rose-300 border-rose-700'
                        }`}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => openModal(product)}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 text-gold-400 hover:bg-gray-700 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 text-rose-400 hover:bg-gray-700 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl shadow-sm p-12 text-center border border-gray-700/50 backdrop-blur-sm">
                        <svg
                          className="mx-auto h-16 w-16 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <h3 className="mt-4 text-xl font-light text-gray-200">No products found</h3>
                        <p className="mt-2 text-gray-500 max-w-md mx-auto">
                          {searchTerm || filterBrand !== "all"
                            ? "Try adjusting your search or filter criteria"
                            : "The system currently has no products"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg ${currentPage === 1 ? 'bg-gray-800/30 text-gray-500 cursor-not-allowed' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'}`}
              >
                Previous
              </button>
              
              {/* Always show first page */}
              {currentPage > 3 && totalPages > 5 && (
                <button
                  onClick={() => paginate(1)}
                  className={`px-3 py-1 rounded-lg ${currentPage === 1 ? 'bg-gold-400/20 text-gold-400 font-medium' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'}`}
                >
                  1
                </button>
              )}
              
              {/* Show ellipsis if needed */}
              {currentPage > 4 && totalPages > 6 && (
                <span className="px-3 py-1 text-gray-400">...</span>
              )}
              
              {/* Show pages around current page */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-1 rounded-lg ${currentPage === pageNum ? 'bg-gold-400/20 text-gold-400 font-medium' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {/* Show ellipsis if needed */}
              {currentPage < totalPages - 3 && totalPages > 6 && (
                <span className="px-3 py-1 text-gray-400">...</span>
              )}
              
              {/* Always show last page */}
              {currentPage < totalPages - 2 && totalPages > 5 && (
                <button
                  onClick={() => paginate(totalPages)}
                  className={`px-3 py-1 rounded-lg ${currentPage === totalPages ? 'bg-gold-400/20 text-gold-400 font-medium' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'}`}
                >
                  {totalPages}
                </button>
              )}
              
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg ${currentPage === totalPages ? 'bg-gray-800/30 text-gray-500 cursor-not-allowed' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Product Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-800 to-gray-800/90 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700/50">
              <div className="flex justify-between items-center border-b border-gray-700/50 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gold-400"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 text-gray-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Brand</label>
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 text-gray-100 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiZxdW90O2N1cnJlbnRDb2xvciZxdW90OyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_0.75rem] bg-[length:1.5rem]"
                      required
                    >
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 text-gray-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 text-gray-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Movement</label>
                    <input
                      type="text"
                      name="movement"
                      value={formData.movement}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 text-gray-100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Water Resistance</label>
                    <input
                      type="text"
                      name="water_resistance"
                      value={formData.water_resistance}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 text-gray-100"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="in_stock"
                      checked={formData.in_stock}
                      onChange={handleChange}
                      className="h-4 w-4 text-gold-400 focus:ring-gold-400 border-gray-600 rounded bg-gray-700/50"
                    />
                    <label className="ml-2 block text-sm text-gray-300">In Stock</label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 text-gray-100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Main Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 text-gray-100"
                    required
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img src={formData.image} alt="Preview" className="h-40 object-contain rounded-lg border border-gray-700/50" />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Video URL</label>
                  <input
                    type="url"
                    name="video"
                    value={formData.video}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all duration-200 text-gray-100"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-300">Gallery Images</label>
                    <button
                      type="button"
                      onClick={addGalleryField}
                      className="text-sm text-gold-400 hover:text-gold-300"
                    >
                      Add Image
                    </button>
                  </div>
                  {formData.gallery.map((url, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleGalleryChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-700 rounded-lg bg-gray-800/50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 text-gray-100"
                        placeholder={`Image URL ${index + 1}`}
                      />
                      {formData.gallery.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeGalleryField(index)}
                          className="ml-2 text-rose-400 hover:text-rose-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gold-500 text-gray-900 font-medium rounded-lg hover:bg-gold-400 transition-colors duration-200"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;