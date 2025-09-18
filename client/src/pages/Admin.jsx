import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react'

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard')

  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12%',
      changeType: 'positive',
      icon: Users
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8%',
      changeType: 'positive',
      icon: ShoppingBag
    },
    {
      title: 'Revenue',
      value: '$45,678',
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign
    },
    {
      title: 'Growth Rate',
      value: '23.5%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp
    }
  ]

  const recentOrders = [
    {
      id: '#ORD-001',
      customer: 'Sarah Johnson',
      email: 'sarah@email.com',
      product: 'Monstera Deliciosa',
      amount: '$45.99',
      status: 'completed',
      date: '2024-01-15'
    },
    {
      id: '#ORD-002',
      customer: 'Mike Chen',
      email: 'mike@email.com',
      product: 'Snake Plant',
      amount: '$24.99',
      status: 'processing',
      date: '2024-01-15'
    },
    {
      id: '#ORD-003',
      customer: 'Emma Wilson',
      email: 'emma@email.com',
      product: 'Pothos Golden',
      amount: '$18.99',
      status: 'shipped',
      date: '2024-01-14'
    },
    {
      id: '#ORD-004',
      customer: 'James Park',
      email: 'james@email.com',
      product: 'ZZ Plant',
      amount: '$32.99',
      status: 'pending',
      date: '2024-01-14'
    }
  ]

  const products = [
    {
      id: 1,
      name: 'Monstera Deliciosa',
      category: 'Indoor Plants',
      price: '$45.99',
      stock: 24,
      status: 'active',
      image: '🌱'
    },
    {
      id: 2,
      name: 'Snake Plant',
      category: 'Indoor Plants',
      price: '$24.99',
      stock: 18,
      status: 'active',
      image: '🐍'
    },
    {
      id: 3,
      name: 'Fiddle Leaf Fig',
      category: 'Indoor Plants',
      price: '$89.99',
      stock: 0,
      status: 'out_of_stock',
      image: '🌿'
    },
    {
      id: 4,
      name: 'Jade Plant',
      category: 'Succulents',
      price: '$16.99',
      stock: 32,
      status: 'active',
      image: '🌵'
    }
  ]

  const tabs = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'orders', name: 'Orders' },
    { id: 'products', name: 'Products' },
    { id: 'users', name: 'Users' },
    { id: 'analytics', name: 'Analytics' }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-forest-green-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-forest-green-800">{stat.value}</p>
                <p className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className="p-3 bg-forest-green-100 rounded-full">
                {React.createElement(stat.icon, { className: "h-6 w-6 text-forest-green-600" })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg"
      >
        <div className="p-6 border-b border-forest-green-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-forest-green-800">Recent Orders</h2>
            <button className="text-forest-green-600 hover:text-forest-green-500 font-medium">
              View All
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-forest-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-green-700 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-green-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-green-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-green-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-green-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-green-700 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-forest-green-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-forest-green-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-forest-green-800">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-forest-green-800">{order.customer}</div>
                      <div className="text-sm text-forest-green-500">{order.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-forest-green-700">
                    {order.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-forest-green-800">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-forest-green-700">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )

  const renderProducts = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-forest-green-800">Products</h2>
        <button className="px-4 py-2 bg-forest-green-500 text-cream-100 rounded-lg hover:bg-forest-green-600 transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-forest-green-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-3 py-2 border border-forest-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green-500"
            />
          </div>
          <select className="px-3 py-2 border border-forest-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green-500">
            <option>All Categories</option>
            <option>Indoor Plants</option>
            <option>Outdoor Plants</option>
            <option>Succulents</option>
            <option>Accessories</option>
          </select>
          <select className="px-3 py-2 border border-forest-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Out of Stock</option>
            <option>Discontinued</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-forest-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-green-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-green-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-green-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-green-700 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-green-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-forest-green-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-forest-green-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-forest-green-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{product.image}</div>
                      <div className="text-sm font-medium text-forest-green-800">
                        {product.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-forest-green-700">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-forest-green-800">
                    {product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-forest-green-700">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                      {product.status.replace('_', ' ').charAt(0).toUpperCase() + product.status.replace('_', ' ').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-forest-green-600 hover:text-forest-green-500">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-500">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard()
      case 'products':
        return renderProducts()
      case 'orders':
        return <div className="text-center py-12 text-forest-green-600">Orders management coming soon...</div>
      case 'users':
        return <div className="text-center py-12 text-forest-green-600">User management coming soon...</div>
      case 'analytics':
        return <div className="text-center py-12 text-forest-green-600">Analytics dashboard coming soon...</div>
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-forest-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-forest-green-800">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-forest-green-600 hover:text-forest-green-500">
                <Search className="h-5 w-5" />
              </button>
              <div className="w-8 h-8 bg-forest-green-500 rounded-full flex items-center justify-center">
                <span className="text-cream-100 text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-forest-green-100 text-forest-green-700 font-medium'
                        : 'text-forest-green-600 hover:bg-forest-green-50'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin