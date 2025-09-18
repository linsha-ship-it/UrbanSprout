import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Heart, ShoppingCart, Star, Grid, List, X, MapPin, CreditCard, Package, Truck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { apiCall } from '../utils/api'
import { initializeRazorpayPayment } from '../config/razorpay'

const Store = () => {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [wishlist, setWishlist] = useState([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    phone: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showOrderSummary, setShowOrderSummary] = useState(false)

  // Load cart and wishlist from database on component mount
  useEffect(() => {
    if (user) {
      // Load from database
      loadCartFromDB()
      loadWishlistFromDB()
      
      // Sync guest data to user account
      syncGuestDataToUser()
    } else {
      // For guest users, use localStorage
      const savedCart = localStorage.getItem('cart_guest')
      const savedWishlist = localStorage.getItem('wishlist_guest')
      
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist))
      }
    }
  }, [user])

  // Sync guest cart/wishlist to user account when they log in
  const syncGuestDataToUser = async () => {
    try {
      const guestCart = localStorage.getItem('cart_guest')
      const guestWishlist = localStorage.getItem('wishlist_guest')
      
      if (guestCart) {
        const cartData = JSON.parse(guestCart)
        if (cartData.length > 0) {
          // Merge guest cart with user cart
          const currentCart = cart || []
          const mergedCart = [...currentCart]
          
          cartData.forEach(guestItem => {
            const existingItem = mergedCart.find(item => item.id === guestItem.id)
            if (existingItem) {
              existingItem.quantity += guestItem.quantity
            } else {
              mergedCart.push(guestItem)
            }
          })
          
          setCart(mergedCart)
          await saveCartToDB(mergedCart)
        }
        
        // Clear guest cart
        localStorage.removeItem('cart_guest')
      }
      
      if (guestWishlist) {
        const wishlistData = JSON.parse(guestWishlist)
        if (wishlistData.length > 0) {
          // Merge guest wishlist with user wishlist
          const currentWishlist = wishlist || []
          const mergedWishlist = [...currentWishlist]
          
          wishlistData.forEach(guestItem => {
            if (!mergedWishlist.find(item => item.id === guestItem.id)) {
              mergedWishlist.push(guestItem)
            }
          })
          
          setWishlist(mergedWishlist)
          await saveWishlistToDB(mergedWishlist)
        }
        
        // Clear guest wishlist
        localStorage.removeItem('wishlist_guest')
      }
    } catch (error) {
      console.error('Error syncing guest data:', error)
    }
  }

  // Load cart from database
  const loadCartFromDB = async () => {
    try {
      const response = await apiCall('/store/cart')
      if (response.success && response.data) {
        // Convert backend data to frontend format
        const formattedCart = response.data.map(item => ({
          id: parseInt(item.productId),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }));
        setCart(formattedCart)
        return
      }
    } catch (error) {
      console.error('Error loading cart from database:', error)
    }
    
    // Fallback to localStorage if database fails or returns empty
    const savedCart = localStorage.getItem(`cart_${user.email}`)
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  // Load wishlist from database
  const loadWishlistFromDB = async () => {
    try {
      const response = await apiCall('/store/wishlist')
      if (response.success && response.data) {
        // Convert backend data to frontend format
        const formattedWishlist = response.data.map(item => ({
          id: parseInt(item.productId),
          name: item.name,
          price: item.price,
          image: item.image
        }));
        setWishlist(formattedWishlist)
        return
      }
    } catch (error) {
      console.error('Error loading wishlist from database:', error)
    }
    
    // Fallback to localStorage if database fails or returns empty
    const savedWishlist = localStorage.getItem(`wishlist_${user.email}`)
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist))
    }
  }

  // Save cart to database
  const saveCartToDB = async (cartData) => {
    // Always save to localStorage as backup
    if (!user) {
      localStorage.setItem('cart_guest', JSON.stringify(cartData))
      return
    }
    
    // Save to localStorage as backup for logged-in users too
    localStorage.setItem(`cart_${user.email}`, JSON.stringify(cartData))
    
    try {
      // Convert cart data to match backend expectations
      const formattedCartData = cartData.map(item => ({
        productId: item.id.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      await apiCall('/store/cart', {
        method: 'POST',
        body: JSON.stringify({ items: formattedCartData })
      })
    } catch (error) {
      console.error('Error saving cart to database:', error)
      // Data is already saved to localStorage as backup
    }
  }

  // Save wishlist to database
  const saveWishlistToDB = async (wishlistData) => {
    // Always save to localStorage as backup
    if (!user) {
      localStorage.setItem('wishlist_guest', JSON.stringify(wishlistData))
      return
    }
    
    // Save to localStorage as backup for logged-in users too
    localStorage.setItem(`wishlist_${user.email}`, JSON.stringify(wishlistData))
    
    try {
      // Convert wishlist data to match backend expectations
      const formattedWishlistData = wishlistData.map(item => ({
        productId: item.id.toString(),
        name: item.name,
        price: item.price,
        image: item.image
      }));

      await apiCall('/store/wishlist', {
        method: 'POST',
        body: JSON.stringify({ items: formattedWishlistData })
      })
    } catch (error) {
      console.error('Error saving wishlist to database:', error)
      // Data is already saved to localStorage as backup
    }
  }

  const products = [
    {
      id: 1,
      name: "Organic Compost Fertilizer",
      description: "Rich organic compost for healthy plant growth",
      price: 299,
      originalPrice: 399,
      rating: 4.8,
      reviews: 124,
      category: 'fertilizers',
      image: "🌱",
      inStock: true,
      isNew: false,
      isSale: true,
      size: "5kg bag",
      features: ["Organic", "Nutrient Rich"]
    },
    {
      id: 2,
      name: "Premium Potting Mix",
      description: "High-quality potting soil for indoor plants",
      price: 199,
      rating: 4.9,
      reviews: 89,
      category: 'fertilizers',
      image: "🪴",
      inStock: true,
      isNew: true,
      isSale: false,
      size: "2kg bag",
      features: ["Well Draining", "pH Balanced"]
    },
    {
      id: 3,
      name: "Professional Garden Spade",
      description: "Heavy-duty stainless steel garden spade",
      price: 899,
      rating: 4.6,
      reviews: 67,
      category: 'tools',
      image: "🪓",
      inStock: true,
      isNew: false,
      isSale: false,
      size: "Standard",
      features: ["Stainless Steel", "Ergonomic Handle"]
    },
    {
      id: 4,
      name: "Ceramic Planter Set",
      description: "Beautiful ceramic planters with drainage",
      price: 1299,
      rating: 4.7,
      reviews: 156,
      category: 'pots',
      image: "🏺",
      inStock: true,
      isNew: false,
      isSale: false,
      size: "Set of 3",
      features: ["Drainage Holes", "Modern Design"]
    },
    {
      id: 5,
      name: "Watering Can",
      description: "Premium brass watering can with fine rose",
      price: 699,
      rating: 4.5,
      reviews: 92,
      category: 'tools',
      image: "🚰",
      inStock: false,
      isNew: false,
      isSale: false,
      size: "2L capacity",
      features: ["Brass Material", "Fine Rose"]
    },
    {
      id: 6,
      name: "Tomato Seeds Pack",
      description: "High-yield hybrid tomato seeds",
      price: 99,
      rating: 4.4,
      reviews: 78,
      category: 'seeds',
      image: "🍅",
      inStock: true,
      isNew: false,
      isSale: false,
      size: "50 seeds",
      features: ["Hybrid", "High Yield"]
    },
    {
      id: 7,
      name: "Plant Labels Set",
      description: "Reusable plant identification labels",
      price: 149,
      originalPrice: 199,
      rating: 4.6,
      reviews: 45,
      category: 'accessories',
      image: "🏷️",
      inStock: true,
      isNew: false,
      isSale: true,
      size: "Set of 20",
      features: ["Reusable", "Weather Resistant"]
    },
    {
      id: 8,
      name: "Garden Pruning Shears",
      description: "Professional bypass pruning shears",
      price: 449,
      rating: 4.8,
      reviews: 134,
      category: 'tools',
      image: "✂️",
      inStock: true,
      isNew: true,
      isSale: false,
      size: "8 inch",
      features: ["Bypass Design", "Sharp Blades"]
    },
    {
      id: 9,
      name: "Terracotta Pot Set",
      description: "Classic terracotta pots in various sizes",
      price: 799,
      rating: 4.7,
      reviews: 98,
      category: 'pots',
      image: "🏺",
      inStock: true,
      isNew: false,
      isSale: false,
      size: "Set of 5",
      features: ["Natural Material", "Breathable"]
    },
    {
      id: 10,
      name: "Liquid Fertilizer",
      description: "Concentrated liquid plant food",
      price: 399,
      rating: 4.5,
      reviews: 76,
      category: 'fertilizers',
      image: "💧",
      inStock: true,
      isNew: false,
      isSale: false,
      size: "500ml",
      features: ["Concentrated", "Easy to Use"]
    }
  ]

  // Calculate category counts dynamically
  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return products.length
    return products.filter(product => product.category === categoryId).length
  }

  const categories = [
    { id: 'all', name: 'All Products', count: getCategoryCount('all') },
    { id: 'fertilizers', name: 'Fertilizers', count: getCategoryCount('fertilizers') },
    { id: 'tools', name: 'Gardening Tools', count: getCategoryCount('tools') },
    { id: 'pots', name: 'Pots & Planters', count: getCategoryCount('pots') },
    { id: 'seeds', name: 'Seeds', count: getCategoryCount('seeds') },
    { id: 'accessories', name: 'Accessories', count: getCategoryCount('accessories') }
  ]

  // Cart functions
  const addToCart = async (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    let newCart
    
    if (existingItem) {
      newCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      newCart = [...cart, { ...product, quantity: 1 }]
    }
    
    setCart(newCart)
    await saveCartToDB(newCart)
  }

  const removeFromCart = async (productId) => {
    const newCart = cart.filter(item => item.id !== productId)
    setCart(newCart)
    await saveCartToDB(newCart)
  }

  const updateQuantity = async (productId, quantity) => {
    let newCart
    if (quantity <= 0) {
      newCart = cart.filter(item => item.id !== productId)
    } else {
      newCart = cart.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      )
    }
    setCart(newCart)
    await saveCartToDB(newCart)
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  // Handle place order
  const handlePlaceOrder = async () => {
    if (isProcessingPayment) {
      return; // Prevent multiple clicks
    }

    // Validate shipping address
    const requiredFields = ['fullName', 'address', 'city', 'state', 'pincode', 'country', 'phone']
    const missingFields = requiredFields.filter(field => !shippingAddress[field].trim())
    
    if (missingFields.length > 0) {
      alert('Please fill in all required shipping address fields.')
      return
    }

    setIsProcessingPayment(true);

    try {
      const orderData = {
        items: cart,
        shippingAddress,
        paymentMethod,
        total: getCartTotal(),
        userId: user?.email || 'guest',
        customerName: shippingAddress.fullName,
        customerEmail: user?.email || '',
        customerPhone: shippingAddress.phone
      }

      if (paymentMethod === 'online') {
        // For online payment, create order and proceed to Razorpay
        await handleOnlinePayment(orderData)
      } else {
        // For COD, show order summary first
        setShowOrderSummary(true)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Error placing order. Please try again.')
    } finally {
      setIsProcessingPayment(false);
    }
  }

  // Handle online payment with Razorpay
  const handleOnlinePayment = async (orderData) => {
    try {
      console.log('Creating Razorpay order with data:', {
        amount: orderData.total,
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          userId: orderData.userId,
          items: orderData.items,
          shippingAddress: orderData.shippingAddress
        }
      });

      // First, create order on backend to get Razorpay order ID
      const response = await apiCall('/store/create-order', {
        method: 'POST',
        body: JSON.stringify({
          amount: orderData.total,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            userId: orderData.userId,
            items: orderData.items,
            shippingAddress: orderData.shippingAddress
          }
        })
      });

      console.log('Razorpay order creation response:', response);

      if (response.success && response.data) {
        const razorpayOrderData = {
          ...orderData,
          amount: orderData.total,
          razorpayOrderId: response.data.id,
          orderId: response.data.receipt
        };

        console.log('Opening Razorpay with data:', razorpayOrderData);

        // Initialize Razorpay payment
        initializeRazorpayPayment(
          razorpayOrderData,
          // Success callback
          async (paymentResponse) => {
            try {
              console.log('Payment successful:', paymentResponse);
              // Verify payment on backend
              const verifyResponse = await apiCall('/store/verify-payment', {
                method: 'POST',
                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  orderData: orderData
                })
              });

              if (verifyResponse.success) {
                // Payment verified successfully
                setCart([])
                await saveCartToDB([])
                setShowCheckout(false)
                setIsProcessingPayment(false)
                alert('Payment successful! Order placed successfully.')
              } else {
                setIsProcessingPayment(false)
                console.error('Payment verification failed:', verifyResponse);
                alert(`Payment verification failed: ${verifyResponse.message || 'Please contact support'}`)
              }
            } catch (error) {
              console.error('Payment verification error:', error)
              setIsProcessingPayment(false)
              alert(`Payment verification failed: ${error.message || 'Please contact support'}`)
            }
          },
          // Error callback
          (error) => {
            console.error('Payment error:', error)
            setIsProcessingPayment(false)
            if (error.includes('cancelled')) {
              alert('Payment was cancelled. You can try again anytime.')
            } else if (error.includes('not available')) {
              alert('Payment gateway is temporarily unavailable. Please refresh the page and try again.')
            } else {
              alert(`Payment failed: ${error}`)
            }
          }
        )
      } else {
        console.error('Failed to create Razorpay order:', response);
        setIsProcessingPayment(false)
        alert(`Failed to create order: ${response.message || 'Please try again'}`)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      setIsProcessingPayment(false)
      alert(`Error creating order: ${error.message || 'Please try again'}`)
    }
  }

  // Handle final order confirmation for COD
  const confirmOrder = async () => {
    setIsProcessingPayment(true);
    
    try {
      const orderData = {
        items: cart,
        shippingAddress,
        paymentMethod,
        total: getCartTotal(),
        userId: user?.email || 'guest',
        customerName: shippingAddress.fullName,
        customerEmail: user?.email || '',
        customerPhone: shippingAddress.phone
      };

      await placeOrderDirectly(orderData);
      setShowOrderSummary(false);
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Error confirming order. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle COD orders
  const placeOrderDirectly = async (orderData) => {
    try {
      // Format order data to match Order model
      const formattedOrderData = {
        items: orderData.items.map(item => ({
          productId: item.id.toString(), // Use productId for hardcoded products
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          image: item.image
        })),
        shippingAddress: {
          fullName: orderData.shippingAddress.fullName,
          address: orderData.shippingAddress.address,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          postalCode: orderData.shippingAddress.pincode,
          country: orderData.shippingAddress.country || 'India',
          phone: orderData.shippingAddress.phone
        },
        paymentMethod: 'Cash on Delivery',
        subtotal: orderData.total,
        shipping: 0,
        tax: 0,
        total: orderData.total,
        status: 'Pending',
        notes: 'Cash on Delivery order'
      };

      console.log('Sending order data:', formattedOrderData);

      const response = await apiCall('/store/orders', {
        method: 'POST',
        body: JSON.stringify(formattedOrderData)
      })

      if (response.success) {
        // Clear cart after successful order
        setCart([])
        await saveCartToDB([])
        
        // Close checkout modal
        setShowCheckout(false)
        setIsProcessingPayment(false)
        
        // Show success message
        alert('Order placed successfully! You will receive a confirmation email shortly.')
      } else {
        setIsProcessingPayment(false)
        console.error('Order creation failed:', response);
        alert(`Failed to place order: ${response.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      setIsProcessingPayment(false)
      alert(`Error placing order: ${error.message || 'Please try again'}`)
    }
  }

  // Wishlist functions
  const addToWishlist = async (product) => {
    if (!wishlist.find(item => item.id === product.id)) {
      const newWishlist = [...wishlist, product]
      setWishlist(newWishlist)
      await saveWishlistToDB(newWishlist)
    }
  }

  const removeFromWishlist = async (productId) => {
    const newWishlist = wishlist.filter(item => item.id !== productId)
    setWishlist(newWishlist)
    await saveWishlistToDB(newWishlist)
  }

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId)
  }

  // Filter products based on category, price, and search
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory
    const priceMatch = (!minPrice || product.price >= parseInt(minPrice)) && 
                      (!maxPrice || product.price <= parseInt(maxPrice))
    const searchMatch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
    return categoryMatch && priceMatch && searchMatch
  })

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-forest-green-600 to-forest-green-700 text-cream-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Garden Store
            </h1>
            <p className="text-xl text-cream-200 max-w-2xl mx-auto mb-8">
              Discover our curated collection of gardening supplies, tools, fertilizers, 
              and accessories for your urban garden.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-cream-300" />
              </div>
              <input
                type="text"
                placeholder="Search gardening supplies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-cream-300 bg-white/10 backdrop-blur-sm text-cream-100 placeholder-cream-300"
              />
            </div>
            
            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-cream-100"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Cart ({cart.length})</span>
              {cart.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  ₹{getCartTotal().toLocaleString()}
                </span>
              )}
            </button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-forest-green-800 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-forest-green-100 text-forest-green-700'
                          : 'text-forest-green-600 hover:bg-forest-green-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <span className="text-sm text-forest-green-400">({category.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-forest-green-800 mb-4">Price Filter</h3>
                
                {/* Price Range */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-forest-green-700 mb-2">
                    Price Range (₹)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-20 px-2 py-1 border border-forest-green-200 rounded text-sm"
                    />
                    <span className="text-forest-green-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-20 px-2 py-1 border border-forest-green-200 rounded text-sm"
                    />
                  </div>
                  </div>
                </div>

              {/* Wishlist */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-forest-green-800 mb-4">Wishlist</h3>
                  <div className="space-y-2">
                  {wishlist.length === 0 ? (
                    <p className="text-sm text-gray-500">No items in wishlist</p>
                  ) : (
                    wishlist.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <div className="text-2xl">{item.image}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">₹{item.price.toLocaleString()}</p>
                  </div>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                  </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-forest-green-600">
                  Showing {filteredProducts.length} products
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-forest-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-forest-green-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-forest-green-500 text-cream-100' : 'text-forest-green-600 hover:bg-forest-green-50'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-forest-green-500 text-cream-100' : 'text-forest-green-600 hover:bg-forest-green-50'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Product Image */}
                  <div className={`relative bg-gradient-to-br from-forest-green-100 to-forest-green-200 flex items-center justify-center ${
                    viewMode === 'list' ? 'w-48 h-48' : 'h-48'
                  }`}>
                    <div className="text-6xl">{product.image}</div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-1">
                      {product.isNew && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded">
                          NEW
                        </span>
                      )}
                      {product.isSale && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                          SALE
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button 
                      onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                      className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                        isInWishlist(product.id) 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/80 hover:bg-white'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : 'text-forest-green-600'}`} />
                      </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-forest-green-800 group-hover:text-forest-green-600 transition-colors">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-forest-green-500">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-forest-green-600">
                          {product.rating}
                        </span>
                        <span className="ml-1 text-xs text-forest-green-400">
                          ({product.reviews})
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-forest-green-100 text-forest-green-700 text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Details */}
                    {product.size && (
                      <div className="text-sm text-forest-green-600 mb-3">
                        <span className="font-medium">Size:</span> {product.size}
                      </div>
                    )}

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-forest-green-800">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-forest-green-400 line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!product.inStock}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          product.inStock
                            ? 'bg-forest-green-500 text-cream-100 hover:bg-forest-green-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {product.inStock ? (
                          <div className="flex items-center">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </div>
                        ) : (
                          'Out of Stock'
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-forest-green-500 text-cream-100 font-semibold rounded-lg hover:bg-forest-green-600 transition-colors">
                Load More Products
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="text-4xl">{item.image}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.size}</p>
                        <p className="text-lg font-bold text-green-600">₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 bg-gray-100 rounded">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">₹{getCartTotal().toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setShowCart(false)
                        setShowCheckout(true)
                      }}
                      className="w-full mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>₹{getCartTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Shipping Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                        placeholder="Enter your complete address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your state"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, pincode: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter pincode"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Method
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-gray-500">Pay when your order arrives</div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Online Payment</div>
                        <div className="text-sm text-gray-500">Pay securely with card/UPI</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Place Order Button */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Cart
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessingPayment}
                    className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingPayment ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary Modal for COD */}
      {showOrderSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                <button
                  onClick={() => setShowOrderSummary(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                          <p className="text-sm text-gray-500">₹{item.price.toLocaleString()} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Shipping Address
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{shippingAddress.fullName}</p>
                      <p className="text-gray-600">{shippingAddress.address}</p>
                      <p className="text-gray-600">
                        {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                      </p>
                      <p className="text-gray-600">{shippingAddress.country}</p>
                      <p className="text-gray-600">Phone: {shippingAddress.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    Payment Method
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold text-sm">₹</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when your order arrives</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Total */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">₹{getCartTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="text-gray-900">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-900">₹0</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">₹{getCartTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowOrderSummary(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Checkout
                  </button>
                  <button
                    onClick={confirmOrder}
                    disabled={isProcessingPayment}
                    className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingPayment ? 'Confirming Order...' : 'Confirm Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Store