import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaCrown, FaUsers, FaStore, FaChartLine, FaCog, FaLock } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Admin Dashboard 👑</h2>
          <p className="text-red-100">
            Manage the UrbanSprout platform and monitor system performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">1,247</h3>
                <p className="text-gray-600 text-sm">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaStore className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">89</h3>
                <p className="text-gray-600 text-sm">Active Vendors</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaLeaf className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">456</h3>
                <p className="text-gray-600 text-sm">Plants Listed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FaChartLine className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">$12.5k</h3>
                <p className="text-gray-600 text-sm">Monthly Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-4">User Management</h3>
            </div>
            <p className="text-gray-600">Manage users, roles, and permissions</p>
          </button>

          <button className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaStore className="text-green-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-4">Vendor Approval</h3>
            </div>
            <p className="text-gray-600">Review and approve vendor applications</p>
          </button>

          <button className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <FaLock className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-4">Content Moderation</h3>
            </div>
            <p className="text-gray-600">Review flagged content and comments</p>
          </button>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <FaUsers className="text-green-600 text-sm" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">New vendor registered</h4>
                  <p className="text-gray-600 text-sm">GreenThumb Gardens • 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <FaLeaf className="text-blue-600 text-sm" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Product flagged for review</h4>
                  <p className="text-gray-600 text-sm">Rare Orchid listing • 4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-yellow-100 p-2 rounded-full mr-3">
                  <FaLock className="text-yellow-600 text-sm" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Comment reported</h4>
                  <p className="text-gray-600 text-sm">Inappropriate content • 6 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Server Status</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Database</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">API Response Time</span>
                <span className="text-gray-900 font-medium">145ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Active Sessions</span>
                <span className="text-gray-900 font-medium">234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Storage Used</span>
                <span className="text-gray-900 font-medium">67%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Admin Tools */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FaCog className="text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">System Settings</span>
            </button>
            <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FaChartLine className="text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Analytics</span>
            </button>
            <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FaLock className="text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Security Logs</span>
            </button>
            <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FaUsers className="text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Bulk Actions</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;