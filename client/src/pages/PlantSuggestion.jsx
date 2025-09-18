import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Droplets, Home, Clock, ChevronRight, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const PlantSuggestion = () => {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState({
    lightLevel: '',
    wateringFrequency: '',
    spaceType: '',
    experience: '',
    petFriendly: false,
    airPurifying: false
  })
  const [showResults, setShowResults] = useState(false)

  const steps = [
    {
      title: "Light Conditions",
      description: "How much natural light does your space receive?",
      icon: Sun,
      options: [
        { value: 'low', label: 'Low Light', description: 'North-facing windows, minimal direct sunlight' },
        { value: 'medium', label: 'Medium Light', description: 'East or west-facing windows, some direct sunlight' },
        { value: 'high', label: 'Bright Light', description: 'South-facing windows, lots of direct sunlight' }
      ]
    },
    {
      title: "Watering Preference",
      description: "How often would you like to water your plants?",
      icon: Droplets,
      options: [
        { value: 'low', label: 'Low Maintenance', description: 'Water once every 2-3 weeks' },
        { value: 'medium', label: 'Moderate Care', description: 'Water once a week' },
        { value: 'high', label: 'Daily Care', description: 'Water every few days, enjoy frequent care' }
      ]
    },
    {
      title: "Space Type",
      description: "Where will you be placing your plants?",
      icon: Home,
      options: [
        { value: 'apartment', label: 'Small Apartment', description: 'Limited space, windowsills, small tables' },
        { value: 'house', label: 'House', description: 'Multiple rooms, floor space available' },
        { value: 'office', label: 'Office', description: 'Desk space, artificial lighting' },
        { value: 'balcony', label: 'Balcony/Patio', description: 'Outdoor space, varying weather conditions' }
      ]
    },
    {
      title: "Experience Level",
      description: "How would you describe your plant care experience?",
      icon: Clock,
      options: [
        { value: 'beginner', label: 'Beginner', description: 'New to plant care, want easy plants' },
        { value: 'intermediate', label: 'Intermediate', description: 'Some experience, ready for moderate challenge' },
        { value: 'expert', label: 'Expert', description: 'Experienced, enjoy challenging plants' }
      ]
    }
  ]

  // Helper: derive simple sunlight category from the existing light text
  const deriveSunlight = (lightText = "") => {
    const t = lightText.toLowerCase()
    if (t.includes('bright') || t.includes('direct')) return 'High sunlight'
    if (t.includes('medium') || t.includes('indirect')) return 'Partial sunlight'
    if (t.includes('low') || t.includes('shade')) return 'Limited sunlight'
    return 'Partial sunlight'
  }

  const plantSuggestions = [
    {
      id: 1,
      name: "Snake Plant",
      scientificName: "Sansevieria trifasciata",
      difficulty: "Beginner",
      light: "Low to Bright",
      water: "Every 2-3 weeks",
      features: ["Air Purifying", "Pet Safe", "Low Maintenance"],
      description: "Perfect for beginners, tolerates neglect and low light conditions.",
      image: "🐍",
      rating: 4.8,
      price: "$25",
      category: "Herb", // example category
      growthTime: "2–3 months", // example duration
      sunlight: deriveSunlight("Low to Bright")
    },
    {
      id: 2,
      name: "Pothos",
      scientificName: "Epipremnum aureum",
      difficulty: "Beginner",
      light: "Low to Medium",
      water: "Weekly",
      features: ["Fast Growing", "Air Purifying", "Trailing"],
      description: "Versatile vine that thrives in various conditions and grows quickly.",
      image: "🌿",
      rating: 4.9,
      price: "$18",
      category: "Herb",
      growthTime: "6–8 weeks",
      sunlight: deriveSunlight("Low to Medium")
    },
    {
      id: 3,
      name: "Monstera Deliciosa",
      scientificName: "Monstera deliciosa",
      difficulty: "Intermediate",
      light: "Medium to Bright",
      water: "Weekly",
      features: ["Statement Plant", "Large Leaves", "Instagram Famous"],
      description: "Stunning split leaves make this a perfect statement plant for any room.",
      image: "🌱",
      rating: 4.7,
      price: "$45",
      category: "Vegetable",
      growthTime: "3–5 months",
      sunlight: deriveSunlight("Medium to Bright")
    },
    {
      id: 4,
      name: "ZZ Plant",
      scientificName: "Zamioculcas zamiifolia",
      difficulty: "Beginner",
      light: "Low to Medium",
      water: "Every 2-3 weeks",
      features: ["Drought Tolerant", "Low Light", "Glossy Leaves"],
      description: "Extremely low maintenance with glossy, attractive foliage.",
      image: "🌿",
      rating: 4.6,
      price: "$32",
      category: "Herb",
      growthTime: "2–4 months",
      sunlight: deriveSunlight("Low to Medium")
    }
  ]

  const handleOptionSelect = (value) => {
    const currentStepKey = steps[currentStep].title.toLowerCase().replace(' ', '')
    setPreferences(prev => ({
      ...prev,
      [currentStepKey === 'lightconditions' ? 'lightLevel' : 
       currentStepKey === 'wateringpreference' ? 'wateringFrequency' :
       currentStepKey === 'spacetype' ? 'spaceType' : 'experience']: value
    }))

    if (currentStep < steps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300)
    } else {
      setTimeout(() => setShowResults(true), 300)
    }
  }

  const resetQuiz = () => {
    setCurrentStep(0)
    setShowResults(false)
    setPreferences({
      lightLevel: '',
      wateringFrequency: '',
      spaceType: '',
      experience: '',
      petFriendly: false,
      airPurifying: false
    })
  }

  // Rank plants based on current selections; used for live suggestions per step
  const rankPlant = (plant) => {
    let score = 0
    const lightText = plant.light?.toLowerCase() || ''
    const diffText = plant.difficulty?.toLowerCase() || ''
    const spaceText = (plant.space || '').toLowerCase()

    if (preferences.lightLevel) {
      if (preferences.lightLevel === 'low' && lightText.includes('low')) score += 2
      if (preferences.lightLevel === 'medium' && lightText.includes('medium')) score += 2
      if (preferences.lightLevel === 'high' && (lightText.includes('bright') || lightText.includes('high'))) score += 2
    }
    if (preferences.experience && diffText.includes(preferences.experience)) score += 1
    if (preferences.spaceType && spaceText.includes(preferences.spaceType)) score += 1
    // Favor air purifying or pet safe when toggled later
    if (preferences.airPurifying && plant.features?.some(f => /air/i.test(f))) score += 1
    if (preferences.petFriendly && plant.features?.some(f => /pet/i.test(f))) score += 1
    return score
  }

  const recommendedPlants = [...plantSuggestions]
    .sort((a, b) => rankPlant(b) - rankPlant(a))
    .slice(0, 8)

  if (showResults) {
    return (
      <div className="min-h-screen bg-cream-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-forest-green-800 mb-4">
              Perfect Plants for You! 🌱
            </h1>
            <p className="text-lg text-forest-green-600 max-w-2xl mx-auto mb-6">
              Based on your preferences, here are our top plant recommendations that will thrive in your space.
            </p>
            <button
              onClick={resetQuiz}
              className="text-forest-green-500 hover:text-forest-green-600 font-medium"
            >
              Take Quiz Again
            </button>
          </motion.div>

          {/* Plant Suggestions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {Array.from({ length: 8 }, (_, idx) => plantSuggestions[idx % plantSuggestions.length]).map((plant, index) => (
              <motion.div
                key={`${plant.id}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 min-h-[480px]"
              >
                {/* Plant Info (Simplified) */}
                <div className="p-6">
                  {/* Name */}
                  <h3 className="text-2xl font-bold text-forest-green-800 mb-4 leading-snug break-words">
                    {plant.name}
                  </h3>

                  {/* Blue box: Type/Category */}
                  <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-sm text-blue-700">Type</div>
                    <div className="text-blue-900 font-semibold">{plant.category}</div>
                  </div>

                  {/* Yellow box: Sunlight */}
                  <div className="mb-6 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="text-sm text-yellow-700">Sunlight</div>
                    <div className="text-yellow-900 font-semibold">{plant.sunlight}</div>
                  </div>

                  {/* Add to my garden button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        try {
                          const key = `my_garden_${user?.id || user?.uid || user?.email || 'guest'}`
                          const existing = JSON.parse(localStorage.getItem(key) || '[]')
                          if (!existing.includes(plant.name)) {
                            const next = [...existing, plant.name]
                            localStorage.setItem(key, JSON.stringify(next))
                          }
                        } catch (e) {
                          console.error('Failed to save to garden', e)
                        }
                      }}
                      className="px-4 py-2 bg-forest-green-500 text-cream-100 rounded-lg hover:bg-forest-green-600 transition-colors"
                    >
                      Add to my garden
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Care Tips */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-forest-green-800 mb-6 text-center">
              Getting Started Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-forest-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sun className="h-6 w-6 text-forest-green-600" />
                </div>
                <h3 className="font-semibold text-forest-green-800 mb-2">Placement</h3>
                <p className="text-sm text-forest-green-600">
                  Place your plants near windows but avoid direct harsh sunlight that can burn leaves.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-forest-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Droplets className="h-6 w-6 text-forest-green-600" />
                </div>
                <h3 className="font-semibold text-forest-green-800 mb-2">Watering</h3>
                <p className="text-sm text-forest-green-600">
                  Check soil moisture with your finger. Water when the top inch feels dry.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-forest-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-forest-green-600" />
                </div>
                <h3 className="font-semibold text-forest-green-800 mb-2">Patience</h3>
                <p className="text-sm text-forest-green-600">
                  Plants need time to adjust to new environments. Don't worry if they look stressed initially.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-green-50 to-cream-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-forest-green-800 mb-4">
            Find Your Perfect Plants
          </h1>
          <p className="text-lg text-forest-green-600 max-w-2xl mx-auto">
            Answer a few questions and we'll recommend the best plants for your space, 
            lifestyle, and experience level.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-forest-green-600">
              Question {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-forest-green-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-forest-green-100 rounded-full h-2">
            <motion.div
              className="bg-forest-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {/* Question Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-forest-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {React.createElement(steps[currentStep].icon, { className: "h-8 w-8 text-forest-green-600" })}
            </div>
            <h2 className="text-2xl font-bold text-forest-green-800 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-forest-green-600">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {steps[currentStep].options.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleOptionSelect(option.value)}
                className="w-full p-4 text-left border-2 border-forest-green-200 rounded-lg hover:border-forest-green-400 hover:bg-forest-green-50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-forest-green-800 group-hover:text-forest-green-600 mb-1">
                      {option.label}
                    </h3>
                    <p className="text-sm text-forest-green-600">
                      {option.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-forest-green-400 group-hover:text-forest-green-600 transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Additional Options for Last Step */}
          {currentStep === steps.length - 1 && (
            <div className="mt-8 pt-6 border-t border-forest-green-200">
              <h3 className="font-semibold text-forest-green-800 mb-4">Additional Preferences (Optional)</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.petFriendly}
                    onChange={(e) => setPreferences(prev => ({ ...prev, petFriendly: e.target.checked }))}
                    className="h-4 w-4 text-forest-green-600 focus:ring-forest-green-500 border-forest-green-300 rounded"
                  />
                  <span className="ml-2 text-forest-green-700">Pet-friendly plants only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.airPurifying}
                    onChange={(e) => setPreferences(prev => ({ ...prev, airPurifying: e.target.checked }))}
                    className="h-4 w-4 text-forest-green-600 focus:ring-forest-green-500 border-forest-green-300 rounded"
                  />
                  <span className="ml-2 text-forest-green-700">Air-purifying plants preferred</span>
                </label>
              </div>
            </div>
          )}
        </motion.div>

        {/* Recommended Plants (Live) */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-forest-green-800 mb-4">Recommended Plants</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recommendedPlants.map((plant, index) => (
              <div key={`${plant.id}-live-${index}`} className="bg-white rounded-xl shadow p-5">
                {/* Name */}
                <h4 className="text-lg font-bold text-forest-green-800 mb-3 leading-snug break-words">{plant.name}</h4>
                {/* Type (Blue) */}
                <div className="mb-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-xs text-blue-700">Type</div>
                  <div className="text-blue-900 font-semibold">{plant.category}</div>
                </div>
                {/* Sunlight (Yellow) */}
                <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="text-xs text-yellow-700">Sunlight</div>
                  <div className="text-yellow-900 font-semibold">{plant.sunlight}</div>
                </div>
                {/* Add to my garden */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      try {
                        const key = `my_garden_${user?.id || user?.uid || user?.email || 'guest'}`
                        const existing = JSON.parse(localStorage.getItem(key) || '[]')
                        if (!existing.includes(plant.name)) {
                          const next = [...existing, plant.name]
                          localStorage.setItem(key, JSON.stringify(next))
                        }
                      } catch (e) {
                        console.error('Failed to save to garden', e)
                      }
                    }}
                    className="px-3 py-2 bg-forest-green-500 text-cream-100 rounded-lg hover:bg-forest-green-600 text-sm"
                  >
                    Add to my garden
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        {currentStep > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-6"
          >
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-forest-green-600 hover:text-forest-green-500 font-medium"
            >
              ← Go Back
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PlantSuggestion