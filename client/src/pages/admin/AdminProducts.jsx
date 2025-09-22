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
  Tag
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
  }, [currentPage, searchTerm, filterCategory, filterStatus, filterFeatured]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(filterCategory && { category: filterCategory }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterFeatured && { featured: filterFeatured })
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
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 text-sm">Manage products, inventory, and categories</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Bulk Actions */}
              {selectedProducts.length > 0 && (
                <div className="flex items-center space-x-2 mr-4 p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700 font-medium">
                    {selectedProducts.length} selected
                  </span>
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

      <div className="px-4 sm:px-6 lg:px-8 py-4">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <option value="Tools">Tools</option>
              <option value="Fertilizers">Fertilizers</option>
              <option value="Pots">Pots</option>
              <option value="Watering Cans">Watering Cans</option>
              <option value="Soil & Compost">Soil & Compost</option>
              <option value="Plant Care">Plant Care</option>
              <option value="Garden Accessories">Garden Accessories</option>
              <option value="Indoor Growing">Indoor Growing</option>
              <option value="Outdoor Growing">Outdoor Growing</option>
              <option value="Seeds">Seeds</option>
              <option value="Planters">Planters</option>
              <option value="Garden Tools">Garden Tools</option>
              <option value="Plant Food">Plant Food</option>
              <option value="Pest Control">Pest Control</option>
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
              <option value="">All Products</option>
              <option value="true">Featured Only</option>
              <option value="false">Non-Featured</option>
            </select>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm text-center ${
            message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
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

      {/* Category Management Modal */}
      {showCategoryModal && (
        <CategoryManagementModal
          categories={categories}
          onClose={() => setShowCategoryModal(false)}
          onUpdate={loadCategories}
        />
      )}
    </div>
  );
};

export default AdminProducts;