import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiCall } from '../../utils/api';
import ProductFormModal from '../../components/admin/ProductFormModal';
import CategoryManagementModal from '../../components/admin/CategoryManagementModal';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Archive,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  AlertTriangle,
  Settings,
  Upload,
  X,
  Save,
  Tag,
  Bell,
  TrendingUp,
  TrendingDown,
  PieChart,
  FileSpreadsheet,
  Download,
  Percent,
  Calendar,
  DollarSign,
  ShoppingCart,
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Filter as FilterIcon,
  SortAsc,
  SortDesc
} from 'lucide-react';

const AdminProducts = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [message, setMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [inventoryStats, setInventoryStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({ priceAdjustment: '', stockAdjustment: '', discountType: 'percentage', discountValue: '' });
  const [discountData, setDiscountData] = useState({ name: '', type: 'percentage', value: '', startDate: '', endDate: '', applicableTo: 'all' });
  const [discountValidation, setDiscountValidation] = useState({ startDateError: '', endDateError: '', valueError: '', isValid: true });
  const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filterStock, setFilterStock] = useState('');
  const [filterPriceRange, setFilterPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    sku: '',
    regularPrice: '',
    discountPrice: '',
    stock: '',
    lowStockThreshold: '10',
    images: [],
    featured: false,
    published: true,
    tags: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    }
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadInventoryStats();
    loadNotifications();
    loadReviews();
    loadCategoriesWithProducts();
  }, [currentPage, searchTerm, filterCategory, filterStatus, filterFeatured, filterStock, filterPriceRange, sortBy, sortOrder]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(filterCategory && { category: filterCategory }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterFeatured && { featured: filterFeatured }),
        ...(filterStock && { stock: filterStock }),
        ...(filterPriceRange.min && { minPrice: filterPriceRange.min }),
        ...(filterPriceRange.max && { maxPrice: filterPriceRange.max }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder })
      });
      
      const response = await apiCall(`/admin/products?${params}`);
      if (response.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setMessage('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiCall('/admin/products/categories');
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadInventoryStats = async () => {
    try {
      const response = await apiCall('/admin/products/inventory-stats');
      if (response.success) {
        setInventoryStats(response.data);
      }
    } catch (error) {
      console.error('Error loading inventory stats:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await apiCall('/admin/notifications');
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await apiCall('/admin/products/reviews');
      if (response.success) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadCategoriesWithProducts = async () => {
    try {
      const response = await apiCall('/admin/products/categories-with-products');
      if (response.success) {
        setCategoriesWithProducts(response.data.categories);
      } else {
        // Fallback: get categories from products if endpoint doesn't exist
        const productsResponse = await apiCall('/admin/products?limit=1000');
        if (productsResponse.success) {
          const uniqueCategories = [...new Set(productsResponse.data.products.map(product => product.category))];
          setCategoriesWithProducts(uniqueCategories.filter(cat => cat));
        }
      }
    } catch (error) {
      console.error('Error loading categories with products:', error);
      // Fallback: use static categories if API fails
      setCategoriesWithProducts(['Tools', 'Fertilizers', 'Pots', 'Plant Care', 'Watering Cans', 'Soil & Compost', 'Garden Accessories', 'Indoor Growing', 'Outdoor Growing', 'Seeds', 'Planters', 'Garden Tools', 'Plant Food', 'Pest Control']);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      sku: '',
      regularPrice: '',
      discountPrice: '',
      stock: '',
      lowStockThreshold: '10',
      images: [],
      featured: false,
      published: true,
      tags: '',
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: ''
      }
    });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        regularPrice: parseFloat(formData.regularPrice),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : null,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : null,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : null
        },
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      const response = await apiCall('/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });

      if (response.success) {
        setMessage('Product created successfully');
        setShowCreateModal(false);
        resetForm();
        loadProducts();
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setMessage('Error creating product: ' + error.message);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        regularPrice: parseFloat(formData.regularPrice),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : null,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : null,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : null
        },
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      const response = await apiCall(`/admin/products/${editingProduct._id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });

      if (response.success) {
        setMessage('Product updated successfully');
        setShowEditModal(false);
        setEditingProduct(null);
        resetForm();
        loadProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage('Error updating product: ' + error.message);
    }
  };

  const handleArchiveProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to archive this product?')) return;
    
    try {
      const response = await apiCall(`/admin/products/${productId}/archive`, {
        method: 'PUT'
      });
      
      if (response.success) {
        setMessage('Product archived successfully');
        loadProducts();
      }
    } catch (error) {
      console.error('Error archiving product:', error);
      setMessage('Error archiving product');
    }
  };

  const handleRestoreProduct = async (productId) => {
    try {
      const response = await apiCall(`/admin/products/${productId}/restore`, {
        method: 'PUT'
      });
      
      if (response.success) {
        setMessage('Product restored successfully');
        loadProducts();
      }
    } catch (error) {
      console.error('Error restoring product:', error);
      setMessage('Error restoring product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')) return;
    
    try {
      const response = await apiCall(`/admin/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        setMessage('Product deleted permanently');
        loadProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage('Error deleting product');
    }
  };

  // Bulk operations
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(products.map(product => product._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleBulkArchive = async () => {
    if (selectedProducts.length === 0) {
      setMessage('Please select products to archive');
      return;
    }

    if (!window.confirm(`Are you sure you want to archive ${selectedProducts.length} products?`)) return;

    try {
      const response = await apiCall('/admin/products/bulk', {
        method: 'PUT',
        body: JSON.stringify({
          productIds: selectedProducts,
          updates: { archived: true, published: false }
        })
      });

      if (response.success) {
        setMessage(`${selectedProducts.length} products archived successfully`);
        setSelectedProducts([]);
        loadProducts();
      }
    } catch (error) {
      console.error('Error archiving products:', error);
      setMessage('Error archiving products');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      setMessage('Please select products to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete ${selectedProducts.length} products? This action cannot be undone.`)) return;

    try {
      // Delete products one by one (bulk delete endpoint would be ideal)
      const deletePromises = selectedProducts.map(productId => 
        apiCall(`/admin/products/${productId}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      setMessage(`${selectedProducts.length} products deleted permanently`);
      setSelectedProducts([]);
      loadProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      setMessage('Error deleting products');
    }
  };

  const handleBulkEdit = async () => {
    if (selectedProducts.length === 0) {
      setMessage('Please select products to edit');
      return;
    }

    try {
      const updates = {};
      
      if (bulkEditData.priceAdjustment) {
        const adjustment = parseFloat(bulkEditData.priceAdjustment);
        updates.priceAdjustment = bulkEditData.discountType === 'percentage' ? adjustment : adjustment;
        updates.priceAdjustmentType = bulkEditData.discountType;
      }
      
      if (bulkEditData.stockAdjustment) {
        updates.stockAdjustment = parseInt(bulkEditData.stockAdjustment);
      }

      const response = await apiCall('/admin/products/bulk-edit', {
        method: 'PUT',
        body: JSON.stringify({
          productIds: selectedProducts,
          updates
        })
      });

      if (response.success) {
        setMessage(`${selectedProducts.length} products updated successfully`);
        setSelectedProducts([]);
        setShowBulkEditModal(false);
        setBulkEditData({ priceAdjustment: '', stockAdjustment: '', discountType: 'percentage', discountValue: '' });
        loadProducts();
      }
    } catch (error) {
      console.error('Error bulk editing products:', error);
      setMessage('Error bulk editing products');
    }
  };

  const handleCSVUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiCall('/admin/products/upload-csv', {
        method: 'POST',
        body: formData
      });

      if (response.success) {
        setMessage(`CSV uploaded successfully. ${response.data.processed} products processed.`);
        loadProducts();
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setMessage('Error uploading CSV: ' + error.message);
    }
  };

  // Live validation function for discount dates and value
  const validateDiscountData = (startDate, endDate, value) => {
    const now = new Date();
    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;
    
    let startDateError = '';
    let endDateError = '';
    let valueError = '';
    let isValid = true;

    // Validate start date - can be today/now but not before
    if (startDate) {
      if (startDateObj < now) {
        startDateError = 'Start date cannot be in the past';
        isValid = false;
      }
    }

    // Validate end date - must be at least the day after start date
    if (endDate && startDate) {
      const nextDay = new Date(startDateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0); // Start of next day
      
      if (endDateObj < nextDay) {
        endDateError = 'End date must be at least the day after start date';
        isValid = false;
      }
    }

    // Validate discount value - cannot be negative
    if (value !== '' && value !== null && value !== undefined) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        valueError = 'Discount value cannot be negative';
        isValid = false;
      }
    }

    setDiscountValidation({ startDateError, endDateError, valueError, isValid });
    return isValid;
  };

  // Handle discount data changes with live validation
  const handleDiscountDataChange = (field, value) => {
    let newDiscountData = { ...discountData, [field]: value };
    
    // If start date changes, clear end date and reset validation
    if (field === 'startDate') {
      newDiscountData = { ...newDiscountData, endDate: '' };
      setDiscountValidation({ startDateError: '', endDateError: '', valueError: '', isValid: true });
    }
    
    setDiscountData(newDiscountData);
    
    // Validate data when it changes
    if (field === 'startDate' || field === 'endDate' || field === 'value') {
      validateDiscountData(
        field === 'startDate' ? value : newDiscountData.startDate,
        field === 'endDate' ? value : newDiscountData.endDate,
        field === 'value' ? value : newDiscountData.value
      );
    }
  };


  const handleCreateDiscount = async () => {
    // Final validation before submission
    if (!validateDiscountData(discountData.startDate, discountData.endDate, discountData.value)) {
      setMessage('Please fix the validation errors before creating the discount');
      return;
    }

    try {
      const response = await apiCall('/admin/products/discounts', {
        method: 'POST',
        body: JSON.stringify(discountData)
      });

      if (response.success) {
        setMessage('Discount created successfully');
        setShowDiscountModal(false);
        setDiscountData({ name: '', type: 'percentage', value: '', startDate: '', endDate: '', applicableTo: 'all' });
        setDiscountValidation({ startDateError: '', endDateError: '', valueError: '', isValid: true });
      }
    } catch (error) {
      console.error('Error creating discount:', error);
      setMessage('Error creating discount: ' + error.message);
    }
  };

  const handleReviewAction = async (reviewId, action) => {
    try {
      const response = await apiCall(`/admin/products/reviews/${reviewId}/${action}`, {
        method: 'PUT'
      });

      if (response.success) {
        setMessage(`Review ${action}ed successfully`);
        loadReviews();
      }
    } catch (error) {
      console.error(`Error ${action}ing review:`, error);
      setMessage(`Error ${action}ing review`);
    }
  };

  const generateCSVReport = () => {
    const headers = ['Product Name', 'SKU', 'Category', 'Current Stock', 'Low Stock Threshold', 'Status', 'Price', 'Total Value'];
    const rows = products.map(product => [
      product.name,
      product.sku,
      product.category,
      product.stock,
      product.lowStockThreshold,
      getStatusText(product),
      product.regularPrice,
      product.stock * product.regularPrice
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const handleBulkToggleFeatured = async () => {
    if (selectedProducts.length === 0) {
      setMessage('Please select products to update');
      return;
    }

    try {
      const response = await apiCall('/admin/products/bulk', {
        method: 'PUT',
        body: JSON.stringify({
          productIds: selectedProducts,
          updates: { featured: true }
        })
      });

      if (response.success) {
        setMessage(`${selectedProducts.length} products marked as featured`);
        setSelectedProducts([]);
        loadProducts();
      }
    } catch (error) {
      console.error('Error updating products:', error);
      setMessage('Error updating products');
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      description: product.description || '',
      sku: product.sku || '',
      regularPrice: product.regularPrice || '',
      discountPrice: product.discountPrice || '',
      stock: product.stock || '',
      lowStockThreshold: product.lowStockThreshold || '10',
      images: product.images || [],
      featured: product.featured || false,
      published: product.published !== false,
      tags: product.tags ? product.tags.join(', ') : '',
      weight: product.weight || '',
      dimensions: {
        length: product.dimensions?.length || '',
        width: product.dimensions?.width || '',
        height: product.dimensions?.height || ''
      }
    });
    setShowEditModal(true);
  };

  const getStatusBadgeColor = (product) => {
    if (product.archived) return 'bg-gray-100 text-gray-800';
    if (!product.published) return 'bg-yellow-100 text-yellow-800';
    if (product.stock === 0) return 'bg-red-100 text-red-800';
    if (product.stock <= product.lowStockThreshold) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (product) => {
    if (product.archived) return 'Archived';
    if (!product.published) return 'Unpublished';
    if (product.stock === 0) return 'Out of Stock';
    if (product.stock <= product.lowStockThreshold) return 'Low Stock';
    return 'Published';
  };

  const getStatusIcon = (product) => {
    if (product.archived) return <Archive className="h-4 w-4 text-gray-600" />;
    if (!product.published) return <EyeOff className="h-4 w-4 text-yellow-600" />;
    if (product.stock === 0) return <XCircle className="h-4 w-4 text-red-600" />;
    if (product.stock <= product.lowStockThreshold) return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  return (
    <>
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 text-sm">Manage products, inventory, pricing, and analytics</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Notification Badge */}
              {notifications.length > 0 && (
                <div className="relative">
                  <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  </button>
                </div>
              )}
              
              {/* Bulk Actions */}
              {selectedProducts.length > 0 && (
                <div className="flex items-center space-x-2 mr-4 p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700 font-medium">
                    {selectedProducts.length} selected
                  </span>
                  <button
                    onClick={() => setShowBulkEditModal(true)}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Bulk Edit
                  </button>
                  <button
                    onClick={handleBulkToggleFeatured}
                    className="flex items-center px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Mark Featured
                  </button>
                  <button
                    onClick={handleBulkArchive}
                    className="flex items-center px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors"
                  >
                    <Archive className="h-3 w-3 mr-1" />
                    Archive
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setShowDiscountModal(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Percent className="h-4 w-4 mr-2" />
                Discounts
              </button>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Categories
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
              <button
                onClick={loadProducts}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'products', name: 'Products', icon: Package },
              { id: 'inventory', name: 'Inventory Dashboard', icon: TrendingUp },
              { id: 'reviews', name: 'Reviews & Ratings', icon: MessageSquare },
              { id: 'analytics', name: 'Analytics', icon: PieChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4">
        {/* Tab Content */}
        {activeTab === 'products' && (
          <>
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products by name, SKU, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category._id}
                  </option>
                ))
              ) : (
                <option value="" disabled>Loading categories...</option>
              )}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Featured</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>
            <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                  <option value="">All Stock</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
            </select>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filterPriceRange.min}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow positive numbers or empty string
                      if (value === '' || (parseFloat(value) >= 0)) {
                        setFilterPriceRange(prev => ({ ...prev, min: value }));
                      }
                    }}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filterPriceRange.max}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow positive numbers or empty string
                      if (value === '' || (parseFloat(value) >= 0)) {
                        setFilterPriceRange(prev => ({ ...prev, max: value }));
                      }
                    }}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock</option>
                    <option value="createdAt">Date Added</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </button>
          </div>
        </div>

              {/* CSV Upload */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleCSVUpload(file);
                      }}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Upload CSV/Excel
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      // Download CSV template
                      const csvContent = 'name,category,description,sku,regularPrice,discountPrice,stock,lowStockThreshold,featured,published\n';
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'products_template.csv';
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </button>
                </div>
              </div>
            </div>

        {/* Inventory Dashboard */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Inventory Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Products</p>
                    <p className="text-2xl font-semibold text-gray-900">{inventoryStats?.totalProducts || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Low Stock</p>
                    <p className="text-2xl font-semibold text-orange-600">{inventoryStats?.lowStockCount || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                    <p className="text-2xl font-semibold text-red-600">{inventoryStats?.outOfStockCount || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Value</p>
                    <p className="text-2xl font-semibold text-gray-900">₹{inventoryStats?.totalValue?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Low Stock Alerts */}
            {inventoryStats?.lowStockProducts && inventoryStats.lowStockProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                    Low Stock Alerts
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventoryStats.lowStockProducts.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {product.images && product.images.length > 0 ? (
                                  <img className="h-10 w-10 rounded-lg object-cover" src={product.images[0]} alt={product.name} />
                                ) : (
                                  <div className="h-10 w-10 rounded-lg bg-gray-300 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-600" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.lowStockThreshold}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              product.stock === 0 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openEditModal(product)}
                              className="text-blue-600 hover:text-blue-500"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews & Ratings Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Product Reviews & Ratings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{review.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{review.customerName}</div>
                        <div className="text-sm text-gray-500">{review.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{review.comment}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          review.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : review.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {review.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleReviewAction(review._id, 'approve')}
                                className="text-green-600 hover:text-green-500"
                                title="Approve review"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReviewAction(review._id, 'reject')}
                                className="text-red-600 hover:text-red-500"
                                title="Reject review"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h3>
                <div className="space-y-3">
                  {inventoryStats?.topSellingProducts?.slice(0, 5).map((product, index) => (
                    <div key={product._id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.salesCount} sold</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">₹{product.totalSales?.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Slow Moving Products</h3>
                <div className="space-y-3">
                  {inventoryStats?.slowMovingProducts?.slice(0, 5).map((product, index) => (
                    <div key={product._id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.salesCount} sold</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">₹{product.totalSales?.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          className="rounded" 
                          checked={selectedProducts.includes(product._id)}
                          onChange={(e) => handleSelectProduct(product._id, e.target.checked)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {product.images && product.images.length > 0 ? (
                              <img className="h-12 w-12 rounded-lg object-cover" src={product.images[0]} alt={product.name} />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-300 flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">₹{product.currentPrice}</span>
                          {product.discountPrice && (
                            <span className="text-xs text-gray-500 line-through">₹{product.regularPrice}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className={product.stock <= product.lowStockThreshold ? 'text-orange-600 font-medium' : ''}>
                            {product.stock}
                          </span>
                          {product.stock <= product.lowStockThreshold && (
                            <AlertTriangle className="h-4 w-4 text-orange-500 ml-1" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(product)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(product)}`}>
                            {getStatusText(product)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.featured ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        ) : (
                          <div className="h-4 w-4"></div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-blue-600 hover:text-blue-500"
                            title="Edit product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {product.archived ? (
                            <button
                              onClick={() => handleRestoreProduct(product._id)}
                              className="text-green-600 hover:text-green-500"
                              title="Restore product"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleArchiveProduct(product._id)}
                              className="text-orange-600 hover:text-orange-500"
                              title="Archive product"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-500"
                            title="Delete permanently"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Create Product Modal */}
      {showCreateModal && (
        <ProductFormModal
          title="Create New Product"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateProduct}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          categories={categories}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <ProductFormModal
          title="Edit Product"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditProduct}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
            resetForm();
          }}
          categories={categories}
        />
      )}

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Bulk Edit Products</h2>
                <button onClick={() => setShowBulkEditModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Adjustment</label>
                  <div className="flex space-x-2">
                    <select value={bulkEditData.discountType} onChange={(e) => setBulkEditData(prev => ({ ...prev, discountType: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                    <input type="number" placeholder="Value" value={bulkEditData.priceAdjustment} onChange={(e) => setBulkEditData(prev => ({ ...prev, priceAdjustment: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Adjustment</label>
                  <input type="number" placeholder="Stock change (positive or negative)" value={bulkEditData.stockAdjustment} onChange={(e) => setBulkEditData(prev => ({ ...prev, stockAdjustment: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowBulkEditModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleBulkEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Apply Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create Discount</h2>
                <button onClick={() => setShowDiscountModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Name</label>
                  <input type="text" placeholder="e.g., Summer Sale 20% Off" value={discountData.name} onChange={(e) => handleDiscountDataChange('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                  <select value={discountData.type} onChange={(e) => handleDiscountDataChange('type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value
                    <span className="text-xs text-gray-500 ml-1">(Positive numbers only)</span>
                  </label>
                  <input 
                    type="number" 
                    placeholder="e.g., 20 for 20% or ₹100" 
                    value={discountData.value} 
                    onChange={(e) => handleDiscountDataChange('value', e.target.value)}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      discountValidation.valueError 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                  {discountValidation.valueError && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {discountValidation.valueError}
                    </p>
                  )}
                  {discountData.value && !discountValidation.valueError && (
                    <p className="text-green-600 text-xs mt-1 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Valid discount value
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date & Time
                      <span className="text-xs text-gray-500 ml-1">(Required first)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={discountData.startDate}
                      onChange={(e) => handleDiscountDataChange('startDate', e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent no-today-button ${
                        discountValidation.startDateError 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Select start date and time"
                    />
                    {discountValidation.startDateError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {discountValidation.startDateError}
                      </p>
                    )}
                    {discountData.startDate && !discountValidation.startDateError && (
                      <p className="text-green-600 text-xs mt-1 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Start date set successfully
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date & Time
                      <span className="text-xs text-gray-500 ml-1">(Day after start date)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={discountData.endDate}
                      onChange={(e) => handleDiscountDataChange('endDate', e.target.value)}
                      min={discountData.startDate ? (() => {
                        const nextDay = new Date(discountData.startDate);
                        nextDay.setDate(nextDay.getDate() + 1);
                        return nextDay.toISOString().slice(0, 16);
                      })() : new Date().toISOString().slice(0, 16)}
                      disabled={!discountData.startDate}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent no-today-button ${
                        !discountData.startDate 
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : discountValidation.endDateError 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder={!discountData.startDate ? "Select start date first" : "Select end date and time"}
                    />
                    {!discountData.startDate && (
                      <p className="text-gray-500 text-xs mt-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Please select start date first
                      </p>
                    )}
                    {discountValidation.endDateError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {discountValidation.endDateError}
                      </p>
                    )}
                    {discountData.endDate && !discountValidation.endDateError && (
                      <p className="text-green-600 text-xs mt-1 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        End date set successfully
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Applicable To
                    <span className="text-xs text-gray-500 ml-1">(Live categories)</span>
                  </label>
                  <select value={discountData.applicableTo} onChange={(e) => handleDiscountDataChange('applicableTo', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">All Products</option>
                    {categoriesWithProducts.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="products">Specific Products (Manual Selection)</option>
                  </select>
                  {categoriesWithProducts.length === 0 && (
                    <p className="text-gray-500 text-xs mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Loading categories...
                    </p>
                  )}
                  {categoriesWithProducts.length > 0 && (
                    <p className="text-green-600 text-xs mt-1 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {categoriesWithProducts.length} categories with products available
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowDiscountModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button 
                  onClick={handleCreateDiscount} 
                  disabled={!discountValidation.isValid}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    discountValidation.isValid 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Create Discount
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <CategoryManagementModal
          categories={categories}
          onClose={() => setShowCategoryModal(false)}
          onUpdate={() => {
            loadCategories();
            loadCategoriesWithProducts();
          }}
        />
      )}
    </div>
    </>
  );
};

export default AdminProducts;