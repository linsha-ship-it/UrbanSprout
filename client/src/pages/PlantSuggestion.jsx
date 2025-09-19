import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  FaLeaf, 
  FaSun, 
  FaHome, 
  FaClock, 
  FaSeedling,
  FaRobot,
  FaTimes,
  FaShoppingCart
} from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { apiCall } from '../utils/api'

const PlantSuggestion = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const messagesEndRef = useRef(null)

  // Initialize chat with welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: "Hi! 🌱 I'm your plant suggestion assistant. I'll help you find the perfect vegetables, fruits, and herbs to grow based on your space, time, and sunlight availability. What would you like to grow?",
      timestamp: new Date(),
      buttons: [
        "I'm a beginner, give me suggestions",
        "I want specific recommendations", 
        "Show me quick growing options"
      ]
    }
    setMessages([welcomeMessage])
    setSessionId(`session_${Date.now()}`)
  }, [])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      const response = await apiCall('/chatbot', {
        method: 'POST',
        body: JSON.stringify({
          message: messageText,
          userId: sessionId
        })
      })

      if (response.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.data.message,
          timestamp: new Date(),
          buttons: response.data.buttons || [],
          plants: response.data.plants || [],
          storeItems: response.data.storeItems || []
        }
        
        setTimeout(() => {
          setMessages(prev => [...prev, botMessage])
          setIsTyping(false)
        }, 800) // Reduced typing delay for better responsiveness
      } else {
        // Handle API errors more gracefully
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.message || "I didn't quite understand that. Let me help you get started!",
          timestamp: new Date(),
          buttons: ["I'm a beginner, give me suggestions", "Show me quick growing options", "I want specific recommendations"]
        }
        setMessages(prev => [...prev, errorMessage])
        setIsTyping(false)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm having trouble connecting right now, but I can still help! Try asking about specific plants like 'lettuce', 'tomatoes', or 'herbs'.",
        timestamp: new Date(),
        buttons: ["I'm a beginner, give me suggestions", "Show me quick growing options", "Try again"]
      }
      setMessages(prev => [...prev, errorMessage])
      setIsTyping(false)
    }
  }

  const handleButtonClick = (buttonText) => {
    sendMessage(buttonText)
  }

  const handleStoreItemClick = (item) => {
    // Navigate to store with the specific item highlighted
    if (item.id) {
      navigate(`/store?highlight=${item.id}`)
    } else {
      // Fallback to store page if no ID
      navigate('/store')
    }
  }

  const handleRestart = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: "Let's start fresh! 🌱 What would you like to grow?",
      timestamp: new Date(),
      buttons: [
        "I'm a beginner, give me suggestions",
        "I want specific recommendations", 
        "Show me quick growing options"
      ]
    }
    setMessages([welcomeMessage])
    setSessionId(`session_${Date.now()}`)
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getPlantIcon = (type) => {
    switch (type) {
      case 'vegetable': return '🥬'
      case 'fruit': return '🍓'
      case 'herb': return '🌿'
      default: return '🌱'
    }
  }

  const getMaintenanceIcon = (level) => {
    switch (level) {
      case 'low': return <FaClock className="text-green-500" />
      case 'medium': return <FaClock className="text-yellow-500" />
      case 'high': return <FaClock className="text-red-500" />
      default: return <FaClock className="text-gray-500" />
    }
  }

  const getSunlightIcon = (level) => {
    switch (level) {
      case 'low': return <FaSun className="text-blue-500" />
      case 'partial': return <FaSun className="text-yellow-500" />
      case 'full': return <FaSun className="text-orange-500" />
      default: return <FaSun className="text-gray-500" />
    }
  }

  const getSpaceIcon = (level) => {
    switch (level) {
      case 'small': return <FaHome className="text-green-500" />
      case 'medium': return <FaHome className="text-blue-500" />
      case 'large': return <FaHome className="text-purple-500" />
      default: return <FaHome className="text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-green-50 to-cream-100 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-[95vh] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4"
        >
          <h1 className="text-3xl font-bold text-forest-green-800 mb-2">
            Plant Suggestion Assistant
          </h1>
          <p className="text-base text-forest-green-600 max-w-2xl mx-auto">
            Chat with our AI assistant to find the perfect vegetables, fruits, and herbs for your growing space.
          </p>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col"
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-forest-green-500 to-forest-green-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaRobot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Plant Assistant</h3>
                <p className="text-xs text-forest-green-100">Online</p>
              </div>
            </div>
            <button
              onClick={handleRestart}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              title="Start Over"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-forest-green-500 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-forest-green-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                    </p>
                  </div>

                    {/* Quick Reply Buttons */}
                    {message.buttons && message.buttons.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.buttons.map((button, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleButtonClick(button)}
                            className="block w-full text-left px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-forest-green-50 hover:border-forest-green-300 transition-colors text-sm"
                          >
                            {button}
              </motion.button>
            ))}
          </div>
                    )}

                    {/* Plant Suggestions */}
                    {message.plants && message.plants.length > 0 && (
                      <div className="mt-3 space-y-3">
                        <h4 className="text-sm font-semibold text-forest-green-700">🌱 Plant Suggestions:</h4>
                        {message.plants.map((plant, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="text-2xl">{getPlantIcon(plant.type)}</div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-800">{plant.name}</h5>
                                <p className="text-xs text-gray-600 mb-2">{plant.description}</p>
                                
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    {getSunlightIcon(plant.sunlight || 'partial')}
                                    <span>{plant.sunlight || 'Partial'} sun</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {getMaintenanceIcon(plant.maintenance || 'low')}
                                    <span>{plant.maintenance || 'Low'} care</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <FaSeedling className="text-green-500" />
                                    <span>{plant.growTime}</span>
              </div>
            </div>
                                
                                <div className="mt-2">
                  <button
                    onClick={() => {
                                      // Add to user's garden
                      try {
                        const key = `my_garden_${user?.id || user?.uid || user?.email || 'guest'}`
                        const existing = JSON.parse(localStorage.getItem(key) || '[]')
                        if (!existing.includes(plant.name)) {
                                          const updated = [...existing, plant.name]
                                          localStorage.setItem(key, JSON.stringify(updated))
                                          alert(`Added ${plant.name} to your garden! 🌱`)
                                        } else {
                                          alert(`${plant.name} is already in your garden!`)
                        }
                      } catch (e) {
                        console.error('Failed to save to garden', e)
                      }
                    }}
                                    className="px-3 py-1 bg-forest-green-500 text-white text-xs rounded-full hover:bg-forest-green-600 transition-colors"
                  >
                                    Add to Garden
                  </button>
                </div>
              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Store Items */}
                    {message.storeItems && message.storeItems.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h4 className="text-sm font-semibold text-forest-green-700">🛒 Recommended Items:</h4>
                        {message.storeItems.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                            onClick={() => handleStoreItemClick(item)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h6 className="text-sm font-medium text-blue-800">{item.name}</h6>
                                  <FaShoppingCart className="w-3 h-3 text-blue-600" />
                                </div>
                                <p className="text-xs text-blue-600 mt-1">{item.description}</p>
                                {item.category && (
                                  <span className="inline-block text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full mt-1">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-semibold text-blue-700 ml-2">{item.price}</span>
                            </div>
                            <div className="mt-2 text-xs text-blue-500 italic">
                              Click to view in store →
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
        </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
          <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Restart Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleRestart}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-forest-green-100 hover:text-forest-green-700 transition-colors font-medium text-sm"
            >
              🔄 Start Over
            </button>
          </div>
          </motion.div>
      </div>
    </div>
  )
}

export default PlantSuggestion
