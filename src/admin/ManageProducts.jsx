import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/Api";
import { toast } from "react-toastify";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  X,
  Eye,
  TrendingUp,
  TrendingDown,
  Star,
  Package,
  Tag,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Download,
  RefreshCw,
  MoreVertical,
  ArrowLeft,
  Crown, // ✅ Added Crown icon for brand
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ManageProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // Sorting
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState("desc");

  // Bulk Actions
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAction, setBulkAction] = useState("");

  // Categories & Brands
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    averagePrice: 0,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/products/");
      const productsData = res.data;
      setProducts(productsData);
      setFilteredProducts(productsData);

      // Extract unique categories and brands
      const uniqueCategories = [
        ...new Set(productsData.map((p) => p.category).filter(Boolean)),
      ];
      const uniqueBrands = [
        ...new Set(productsData.map((p) => p.brand).filter(Boolean)),
      ];
      setCategories(["all", ...uniqueCategories]);
      setBrands(["all", ...uniqueBrands]);

      // Calculate stats
      calculateStats(productsData);
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

  // Calculate Statistics
  const calculateStats = (productsData) => {
    const total = productsData.length;
    const inStock = productsData.filter((p) => p.stock > 10).length;
    const lowStock = productsData.filter(
      (p) => p.stock > 0 && p.stock <= 10
    ).length;
    const outOfStock = productsData.filter((p) => p.stock === 0).length;
    const totalValue = productsData.reduce(
      (sum, p) => sum + p.price * p.stock,
      0
    );
    const averagePrice = total > 0 ? totalValue / total : 0;

    setStats({
      total,
      inStock,
      lowStock,
      outOfStock,
      totalValue,
      averagePrice,
    });
  };

  // Apply Filters
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.sku?.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrand !== "all") {
      filtered = filtered.filter((p) => p.brand === selectedBrand);
    }

    // Price range filter
    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));
    }

    // Stock filter
    switch (stockFilter) {
      case "inStock":
        filtered = filtered.filter((p) => p.stock > 10);
        break;
      case "lowStock":
        filtered = filtered.filter((p) => p.stock > 0 && p.stock <= 10);
        break;
      case "outOfStock":
        filtered = filtered.filter((p) => p.stock === 0);
        break;
      default:
        break;
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Date range filter
    if (startDate && endDate) {
      filtered = filtered.filter((p) => {
        const productDate = new Date(p.created_at || p.updated_at);
        return productDate >= startDate && productDate <= endDate;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "stock":
          comparison = a.stock - b.stock;
          break;
        case "created_at":
          comparison = new Date(a.created_at) - new Date(b.created_at);
          break;
        case "rating":
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case "brand":
          comparison = a.brand.localeCompare(b.brand);
          break;
        default:
          comparison = new Date(b.created_at) - new Date(a.created_at);
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    stockFilter,
    statusFilter,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  // Handle Delete
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    )
      return;
    try {
      await API.delete(`/products/${id}/`);
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted successfully");
    } catch (err) {
      console.error("Error deleting product", err);
      toast.error("Failed to delete product");
    }
  };

  // Bulk Actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) {
      toast.error("Please select products and an action");
      return;
    }

    try {
      switch (bulkAction) {
        case "delete":
          if (
            window.confirm(
              `Delete ${selectedProducts.length} selected products?`
            )
          ) {
            await Promise.all(
              selectedProducts.map((id) => API.delete(`/products/${id}/`))
            );
            setProducts(
              products.filter((p) => !selectedProducts.includes(p.id))
            );
            toast.success(`${selectedProducts.length} products deleted`);
          }
          break;
        case "activate":
          await Promise.all(
            selectedProducts.map((id) =>
              API.patch(`/products/${id}/`, { status: "active" })
            )
          );
          toast.success(`${selectedProducts.length} products activated`);
          break;
        case "deactivate":
          await Promise.all(
            selectedProducts.map((id) =>
              API.patch(`/products/${id}/`, { status: "inactive" })
            )
          );
          toast.success(`${selectedProducts.length} products deactivated`);
          break;
        case "export":
          // Export logic here
          toast.success("Export started");
          break;
        default:
          break;
      }
      setSelectedProducts([]);
      setBulkAction("");
      fetchProducts();
    } catch (err) {
      console.error("Bulk action failed", err);
      toast.error("Bulk action failed");
    }
  };

  // Toggle product selection
  const toggleProductSelection = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id)
        ? prev.filter((productId) => productId !== id)
        : [...prev, id]
    );
  };

  // Select all products on current page
  const toggleSelectAll = () => {
    const pageProducts = filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    if (selectedProducts.length === pageProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(pageProducts.map((p) => p.id));
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setMinPrice("");
    setMaxPrice("");
    setStockFilter("all");
    setStatusFilter("all");
    setDateRange([null, null]);
    setSortBy("newest");
    setSortOrder("desc");
  };

  // Handle back button click
  const handleBack = () => {
    navigate("/admin"); // 
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-[1920px] mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-yellow-500 font-serif tracking-tight">
                Manage Collection
              </h1>
              <p className="text-gray-400 text-sm mt-2">
                Total {stats.total} products • Inventory Value: ₹
                {stats.totalValue.toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <button
                onClick={fetchProducts}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all border border-gray-700"
              >
                <RefreshCw size={18} />
                Refresh
              </button>

              <Link
                to="/add-product"
                className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/20"
              >
                <Plus size={20} />
                Add Product
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.total}
                </p>
              </div>
              <Package className="text-yellow-500 w-8 h-8" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">In Stock</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.inStock}
                </p>
              </div>
              <TrendingUp className="text-green-500 w-8 h-8" />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {stats.inStock > 0 ? "Good stock levels" : "No stock available"}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Low Stock</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.lowStock}
                </p>
              </div>
              <AlertCircle className="text-orange-500 w-8 h-8" />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {stats.lowStock > 0
                ? "Needs restocking"
                : "All items well-stocked"}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-red-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Out of Stock</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.outOfStock}
                </p>
              </div>
              <TrendingDown className="text-red-500 w-8 h-8" />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {stats.outOfStock > 0
                ? "Urgent attention needed"
                : "All items available"}
            </p>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="text-yellow-500 w-5 h-5" />
              <h2 className="text-lg font-semibold text-white">
                Filters & Search
              </h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetFilters}
                className="text-gray-400 hover:text-white text-sm flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
              >
                <X size={16} />
                Clear Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white placeholder-gray-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white"
              >
                <option value="all">All Categories</option>
                {categories
                  .filter((c) => c !== "all")
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white"
              >
                <option value="all">All Brands</option>
                {brands
                  .filter((b) => b !== "all")
                  .map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
              </select>
            </div>
            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all text-white"
              >
                <option value="newest">Newest First</option>
                <option value="name">Name A-Z</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
                <option value="brand">Brand</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-900/80 border-b border-gray-700">
                <tr className="text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium w-12"></th>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Brand</th>{" "}
                  {/* ✅ Added Brand Column */}
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-700/20 transition-colors group"
                    >
                      <td className="p-4"></td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-900 border border-gray-700 flex-shrink-0">
                            {product.image ? (
                              <img
                                src={
                                  product.image.startsWith("http")
                                    ? product.image
                                    : `http://127.0.0.1:8000${product.image}`
                                }
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate max-w-[180px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[180px]">
                              {product.description?.substring(0, 30)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Brand Column */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          <span className="text-gray-300 text-sm font-medium">
                            {product.brand || "No Brand"}
                          </span>
                        </div>
                        {product.sku && (
                          <p className="text-xs text-gray-500 mt-1">
                            SKU: {product.sku}
                          </p>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="text-gray-300 text-sm">
                          {product.category || "Uncategorized"}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-yellow-500 font-medium">
                        ₹{parseFloat(product.price).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-sm font-medium ${
                              product.stock > 10
                                ? "text-green-400"
                                : product.stock > 0
                                ? "text-orange-400"
                                : "text-red-400"
                            }`}
                          >
                            {product.stock} units
                          </span>
                          <div className="w-24 bg-gray-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                product.stock > 10
                                  ? "bg-green-500"
                                  : product.stock > 0
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (product.stock / 50) * 100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${product.id}`}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            to={`/edit-product/${product.id}`}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                          <Search className="w-8 h-8 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white mb-2">
                            No products found
                          </h3>
                          <p className="text-gray-400 mb-4">
                            Try adjusting your filters or add a new product
                          </p>
                          <Link
                            to="/add-product"
                            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2.5 px-6 rounded-lg transition-colors"
                          >
                            <Plus size={18} />
                            Add New Product
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="border-t border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredProducts.length
                  )}{" "}
                  of {filteredProducts.length} products
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-gray-900 border border-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-yellow-500 transition-all text-white"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUp className="w-5 h-5 rotate-90" />
                </button>
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
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[40px] h-10 rounded-lg border transition-colors ${
                        currentPage === pageNum
                          ? "bg-yellow-500 border-yellow-500 text-black"
                          : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
