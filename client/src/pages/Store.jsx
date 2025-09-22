import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, Heart, ShoppingCart, Star, Grid, List, X, MapPin, CreditCard, Package, Truck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { apiCall } from '../utils/api'
import { initializeRazorpayPayment } from '../config/razorpay'
import ProductImageSlideshow from '../components/ProductImageSlideshow'

const Store = () => {
  console.log('Store component rendering...')
  
  try {
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const highlightedProductId = searchParams.get('highlight')
    console.log('Store component hooks initialized successfully')
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
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showOrderSummary, setShowOrderSummary] = useState(false)

  // Load products from API
  const loadProducts = async () => {
    try {
      setLoading(true)
      console.log('Loading products from API...')
      const response = await apiCall('/store')
      console.log('API response:', response)
      
      if (response.success && response.data && response.data.products) {
        setProducts(response.data.products)
        console.log('Products loaded successfully:', response.data.products.length)
      } else {
        console.error('API response invalid:', response)
        setProducts([]) // Set empty array as fallback
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([]) // Set empty array as fallback
    } finally {
      setLoading(false)
    }
  }

  // Load cart and wishlist from database on component mount
  useEffect(() => {
    loadProducts()
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

  // Products are now loaded from API via loadProducts() function


  // Calculate category counts dynamically
  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return (products || []).length
    return (products || []).filter(product => product.category === categoryId).length
  }

  const categories = [
    { id: 'all', name: 'All Products', count: getCategoryCount('all') },
    { id: 'Fertilizers', name: 'Fertilizers', count: getCategoryCount('Fertilizers') },
    { id: 'Tools', name: 'Gardening Tools', count: getCategoryCount('Tools') },
    { id: 'Pots', name: 'Pots & Planters', count: getCategoryCount('Pots') },
    { id: 'Watering Cans', name: 'Watering Cans', count: getCategoryCount('Watering Cans') }
  ]

  // Cart functions
  const addToCart = async (product) => {
    console.log('Adding product to cart:', product);
    
    const productId = product._id || product.id;
    const existingItem = (cart || []).find(item => item.id === productId)
    let newCart
    
    if (existingItem) {
      newCart = (cart || []).map(item => 
        item.id === productId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      // Create a clean cart item with consistent structure
      const cartItem = {
        id: productId,
        _id: productId, // Keep both for compatibility
        name: product.name,
        price: product.discountPrice || product.regularPrice || product.price || 0,
        image: product.images?.[0] || product.image,
        category: product.category,
        stock: product.stock,
        inStock: product.stock > 0,
        quantity: 1
      };
      newCart = [...cart, cartItem]
    }
    
    console.log('New cart:', newCart);
    setCart(newCart)
    await saveCartToDB(newCart)
  }

  const removeFromCart = async (productId) => {
    const newCart = (cart || []).filter(item => item.id !== productId)
    setCart(newCart)
    await saveCartToDB(newCart)
  }

  const updateQuantity = async (productId, quantity) => {
    let newCart
    if (quantity <= 0) {
      newCart = (cart || []).filter(item => item.id !== productId)
    } else {
      newCart = (cart || []).map(item => 
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

    // Check if user is authenticated
    if (!user) {
      alert('Please log in to place an order.')
      return
    }

    // Validate shipping address
    const requiredFields = ['fullName', 'address', 'city', 'state', 'pincode', 'country', 'phone']
    const missingFields = requiredFields.filter(field => !shippingAddress[field].trim())
    
    if (missingFields.length > 0) {
      alert('Please fill in all required shipping address fields.')
      return
    }

    console.log('User:', user)
    console.log('Token:', localStorage.getItem('urbansprout_token'))

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

      console.log('Order data being sent:', JSON.stringify(orderData, null, 2))

      if (paymentMethod === 'online') {
        // For online payment, create order and proceed to Razorpay
        await handleOnlinePayment(orderData)
      } else {
        // For COD, show order summary first
        setShowOrderSummary(true)
        setIsProcessingPayment(false) // Reset processing state for COD
      }
    } catch (error) {
      console.error('Error placing order:', error)
      if (error.message.includes('User not found') || error.message.includes('Token is not valid')) {
        alert('Your session has expired. Please log in again to place orders.')
        // Clear user state
        localStorage.removeItem('urbansprout_token');
        localStorage.removeItem('urbansprout_user');
        window.location.href = '/login';
      } else {
        alert('Error placing order. Please try again.')
      }
      setIsProcessingPayment(false);
    }
  }

  // Handle online payment with Razorpay
  const handleOnlinePayment = async (orderData) => {
    try {
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        console.error('Razorpay script not loaded');
        alert('Payment gateway is not available. Please refresh the page and try again.');
        setIsProcessingPayment(false);
        return;
      }

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
        console.log('Razorpay available:', !!window.Razorpay);

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
      if (error.message.includes('User not found') || error.message.includes('Token is not valid')) {
        alert('Your session has expired. Please log in again to place orders.')
        // Clear user state
        localStorage.removeItem('urbansprout_token');
        localStorage.removeItem('urbansprout_user');
        window.location.href = '/login';
      } else {
        alert(`Error creating order: ${error.message || 'Please try again'}`)
      }
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
          productId: String(item.id || item._id || 'unknown'), // Safe string conversion
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
      if (error.message.includes('User not found') || error.message.includes('Token is not valid')) {
        alert('Your session has expired. Please log in again to place orders.')
        // Clear user state
        localStorage.removeItem('urbansprout_token');
        localStorage.removeItem('urbansprout_user');
        window.location.href = '/login';
      } else {
        alert(`Error placing order: ${error.message || 'Please try again'}`)
      }
    }
  }

  // Input validation functions
  const validatePhoneNumber = (value) => {
    // Only allow numbers, spaces, hyphens, and plus sign
    return value.replace(/[^0-9\s\-\+]/g, '');
  };

  const validatePincode = (value) => {
    // Only allow numbers
    return value.replace(/[^0-9]/g, '');
  };

  const validateAlphabetOnly = (value) => {
    // Only allow letters and spaces
    return value.replace(/[^a-zA-Z\s]/g, '');
  };

  const validateAlphaNumeric = (value) => {
    // Allow letters, numbers, spaces, and common punctuation for addresses
    return value.replace(/[^a-zA-Z0-9\s\.,\-\#\/]/g, '');
  };

  // Enhanced validation with feedback
  const handleInputChange = (field, value, validator) => {
    const validatedValue = validator(value);
    setShippingAddress(prev => ({ ...prev, [field]: validatedValue }));
    
    // Show brief feedback if input was modified
    if (value !== validatedValue && value.length > validatedValue.length) {
      // Only show feedback if characters were removed
      console.log(`Invalid characters removed from ${field}`);
    }
  };

  // Wishlist functions
  const addToWishlist = async (product) => {
    const productId = product._id || product.id;
    if (!wishlist.find(item => (item.id || item._id) === productId)) {
      const newWishlist = [...wishlist, { ...product, id: productId }]
      setWishlist(newWishlist)
      await saveWishlistToDB(newWishlist)
    } else {
      // Product already in wishlist, show message
      alert('This item is already in your wishlist!')
    }
  }

  const removeFromWishlist = async (productId) => {
    const newWishlist = wishlist.filter(item => (item.id || item._id) !== productId)
    setWishlist(newWishlist)
    await saveWishlistToDB(newWishlist)
  }

  const isInWishlist = (productId) => {
    return wishlist.some(item => (item.id || item._id) === productId)
  }

  // Filter products based on category, price, and search
  const filteredProducts = (products || []).filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory
    
    // Use currentPrice (discountPrice if available, otherwise regularPrice)
    const currentPrice = product.discountPrice || product.regularPrice || product.price || 0
    const priceMatch = (!minPrice || currentPrice >= parseInt(minPrice)) && 
                      (!maxPrice || currentPrice <= parseInt(maxPrice))
    
    const searchMatch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return categoryMatch && priceMatch && searchMatch
  })

  console.log('Store component about to render, products:', (products || []).length)
  
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

      {/* Highlighted Product Banner */}
      {highlightedProductId && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 mx-4 sm:mx-6 lg:mx-8 rounded-r-lg"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🤖</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Recommended by our Plant Assistant
              </h3>
              <p className="text-sm text-blue-600">
                This item was suggested based on your plant preferences. Scroll down to see it highlighted!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-forest-green-800 mb-4">Categories</h3>
                <div className="space-y-2">
                  {(categories || []).map((category) => (
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
                    (wishlist || []).map((item) => (
                      <div key={item.id || item._id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-8 h-8 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'block'
                          }}
                        />
                        <div className="text-2xl hidden">{item.name.charAt(0)}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">₹{item.price.toLocaleString()}</p>
                  </div>
                        <button
                          onClick={() => removeFromWishlist(item.id || item._id)}
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
            {/* Products Grid */}
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group ${
                    viewMode === 'list' ? 'flex' : ''
                  } ${
                    highlightedProductId === product._id ? 'ring-4 ring-blue-500 ring-opacity-50 shadow-2xl' : ''
                  }`}
                >
                  {/* Product Image Slideshow */}
                  <ProductImageSlideshow 
                    images={product.images || [product.image]} 
                    productName={product.name}
                    className={`${viewMode === 'list' ? 'w-48 h-48' : 'h-48'}`}
                  >
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
                      onClick={() => isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product)}
                      className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                        isInWishlist(product._id) 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/80 hover:bg-white'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(product._id) ? 'fill-current' : 'text-forest-green-600'}`} />
                    </button>
                  </ProductImageSlideshow>

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
                      {(product.features || []).map((feature, idx) => (
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
                          ₹{(product.discountPrice || product.regularPrice || product.price || 0).toLocaleString()}
                        </span>
                        {product.discountPrice && product.regularPrice && (
                          <span className="text-sm text-forest-green-400 line-through">
                            ₹{product.regularPrice.toLocaleString()}
                          </span>
                        )}
                        {product.discountPrice && product.regularPrice && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                            {Math.round(((product.regularPrice - product.discountPrice) / product.regularPrice) * 100)}% OFF
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          product.stock > 0
                            ? 'bg-forest-green-500 text-cream-100 hover:bg-forest-green-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {product.stock > 0 ? (
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
            )}

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
                  {(cart || []).map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'block'
                        }}
                      />
                      <div className="text-4xl hidden">{item.name.charAt(0)}</div>
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
                        if (!user) {
                          alert('Please log in to proceed with checkout.')
                          return
                        }
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
      {showCheckout && user && (
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
                    {(cart || []).map((item) => (
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
                        onChange={(e) => {
                          const validatedName = validateAlphabetOnly(e.target.value);
                          setShippingAddress(prev => ({ ...prev, fullName: validatedName }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your full name (letters only)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => {
                          const validatedPhone = validatePhoneNumber(e.target.value);
                          setShippingAddress(prev => ({ ...prev, phone: validatedPhone }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your phone number (numbers only)"
                        maxLength="15"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        value={shippingAddress.address}
                        onChange={(e) => {
                          const validatedAddress = validateAlphaNumeric(e.target.value);
                          setShippingAddress(prev => ({ ...prev, address: validatedAddress }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                        placeholder="Enter your complete address (letters, numbers, and basic punctuation)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => {
                          const validatedCity = validateAlphabetOnly(e.target.value);
                          setShippingAddress(prev => ({ ...prev, city: validatedCity }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your city (letters only)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => {
                          const validatedState = validateAlphabetOnly(e.target.value);
                          setShippingAddress(prev => ({ ...prev, state: validatedState }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your state (letters only)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={shippingAddress.pincode}
                        onChange={(e) => {
                          const validatedPincode = validatePincode(e.target.value);
                          setShippingAddress(prev => ({ ...prev, pincode: validatedPincode }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter pincode (numbers only)"
                        maxLength="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={shippingAddress.country}
                        onChange={(e) => {
                          const validatedCountry = validateAlphabetOnly(e.target.value);
                          setShippingAddress(prev => ({ ...prev, country: validatedCountry }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter country (letters only)"
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
                    {(cart || []).map((item) => (
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
  } catch (error) {
    console.error('Store component error:', error)
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Store Component Error</h1>
          <p className="text-red-500 mb-4">Error: {error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }
}

export default Store