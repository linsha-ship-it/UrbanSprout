import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaLeaf, FaTrash, FaFileAlt, FaCheckCircle, FaTimesCircle, FaClock, FaJournalWhills } from 'react-icons/fa';
import { apiCall } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const BeginnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // My Garden state sourced from localStorage written by the chatbot
  const [garden, setGarden] = useState([]);
  
  // Blog posts state
  const [blogPosts, setBlogPosts] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);

  const getPossibleKeys = () => {
    const ids = [user?.id, user?.uid, user?.email, 'guest'].filter(Boolean);
    // Deduplicate keys
    return Array.from(new Set(ids.map(v => `my_garden_${v}`)));
  };

  const loadGarden = () => {
    for (const key of getPossibleKeys()) {
      const val = localStorage.getItem(key);
      if (val) {
        try { return JSON.parse(val); } catch { return []; }
      }
    }
    return [];
  };

  const persistGarden = (plants) => {
    const key = `my_garden_${user?.id || user?.uid || user?.email || 'guest'}`;
    localStorage.setItem(key, JSON.stringify(plants));
  };

  // Load user's blog posts
  const loadBlogPosts = async () => {
    if (!user) return;
    
    try {
      setLoadingBlogs(true);
      const response = await apiCall('/blog/my-posts');
      if (response.success) {
        setBlogPosts(response.data.posts || []);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoadingBlogs(false);
    }
  };

  useEffect(() => {
    setGarden(loadGarden());
    loadBlogPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.uid, user?.email]);

  const removePlant = (name) => {
    setGarden(prev => {
      const next = prev.filter(p => p !== name);
      persistGarden(next);
      return next;
    });
  };

  const clearGarden = () => {
    const key = `my_garden_${user?.id || user?.uid || user?.email || 'guest'}`;
    localStorage.setItem(key, JSON.stringify([]));
    setGarden([]);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to UrbanSprout, {user.name}! 🌱</h2>
          <p className="text-green-100">
            Start your plant journey with our beginner-friendly guides and community support.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/my-garden-journal')}
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaJournalWhills className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">My Garden Journal</h3>
                <p className="text-gray-600 text-sm">Track your plants, progress, and memories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Getting Started */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Choose Your First Plant</h4>
                  <p className="text-gray-600 text-sm">Start with easy-care plants like pothos or snake plants</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Learn Basic Care</h4>
                  <p className="text-gray-600 text-sm">Understand watering, lighting, and feeding basics</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Join the Community</h4>
                  <p className="text-gray-600 text-sm">Share your progress and get support</p>
                </div>
              </div>
            </div>
          </div>

          {/* My Garden */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">My Garden</h3>
              {garden.length > 0 && (
                <button
                  onClick={clearGarden}
                  className="text-sm inline-flex items-center px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <FaTrash className="mr-1" /> Clear all
                </button>
              )}
            </div>

            {garden.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FaLeaf className="text-4xl text-gray-300 mx-auto mb-2" />
                <p>No plants saved yet</p>
                <p className="text-sm">Use "Add to my Garden" in the Plant Suggestion assistant</p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {garden.map((name) => (
                  <li
                    key={name}
                    className="flex items-center justify-between border rounded-lg px-3 py-2"
                  >
                    <span className="text-gray-800 font-medium">{name}</span>
                    <button
                      onClick={() => removePlant(name)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Blog Posts Status */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaFileAlt className="mr-2 text-blue-600" />
              My Blog Posts Status
            </h3>
            <button
              onClick={loadBlogPosts}
              className="text-sm inline-flex items-center px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              Refresh
            </button>
          </div>

          {loadingBlogs ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading your posts...</p>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-2" />
              <p>No blog posts yet</p>
              <p className="text-sm">Create your first post in the community blog</p>
            </div>
          ) : (
            <div className="space-y-4">
              {blogPosts.map((post) => (
                <div key={post._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{post.title}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.content?.substring(0, 150)}...</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center">
                      {post.approvalStatus === 'approved' ? (
                        <div className="flex items-center text-green-600">
                          <FaCheckCircle className="mr-1" />
                          <span className="text-sm font-medium">Approved</span>
                        </div>
                      ) : post.approvalStatus === 'rejected' ? (
                        <div className="flex items-center text-red-600">
                          <FaTimesCircle className="mr-1" />
                          <span className="text-sm font-medium">Rejected</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-yellow-600">
                          <FaClock className="mr-1" />
                          <span className="text-sm font-medium">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {post.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {post.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BeginnerDashboard;