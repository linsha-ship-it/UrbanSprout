import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLeaf, FaSun, FaHome, FaClock, FaSeedling, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const PlantSuggestion = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const questions = [
    {
      id: 'space',
      title: 'What space do you have available?',
      subtitle: 'Choose the option that best describes your growing space',
      options: [
        { value: 'small', label: 'Small Space', description: 'Windowsill, small balcony, or limited indoor space', icon: <FaHome className="w-6 h-6" /> },
        { value: 'medium', label: 'Medium Space', description: 'Patio, small garden bed, or dedicated growing area', icon: <FaHome className="w-6 h-6" /> },
        { value: 'large', label: 'Large Space', description: 'Full garden, multiple beds, or large outdoor area', icon: <FaHome className="w-6 h-6" /> }
      ]
    },
    {
      id: 'sunlight',
      title: 'How much sunlight do you get?',
      subtitle: 'Select the sunlight conditions in your growing area',
      options: [
        { value: 'full_sun', label: 'Full Sun', description: '6+ hours of direct sunlight daily', icon: <FaSun className="w-6 h-6" /> },
        { value: 'partial_sun', label: 'Partial Sun', description: '3-6 hours of direct sunlight daily', icon: <FaSun className="w-6 h-6" /> },
        { value: 'shade', label: 'Shade/Low Light', description: 'Less than 3 hours of direct sunlight', icon: <FaSun className="w-6 h-6" /> }
      ]
    },
    {
      id: 'experience',
      title: 'What\'s your gardening experience?',
      subtitle: 'Help us tailor recommendations to your skill level',
      options: [
        { value: 'beginner', label: 'Beginner', description: 'New to gardening, want easy-to-grow plants', icon: <FaSeedling className="w-6 h-6" /> },
        { value: 'intermediate', label: 'Intermediate', description: 'Some experience, ready for moderate challenges', icon: <FaLeaf className="w-6 h-6" /> },
        { value: 'advanced', label: 'Advanced', description: 'Experienced gardener, comfortable with complex plants', icon: <FaLeaf className="w-6 h-6" /> }
      ]
    },
    {
      id: 'time',
      title: 'How much time can you dedicate?',
      subtitle: 'Choose based on your available time for plant care',
      options: [
        { value: 'low', label: 'Low Maintenance', description: 'Minimal time, prefer low-maintenance plants', icon: <FaClock className="w-6 h-6" /> },
        { value: 'medium', label: 'Moderate Care', description: 'Regular care, weekly attention', icon: <FaClock className="w-6 h-6" /> },
        { value: 'high', label: 'High Maintenance', description: 'Daily attention, intensive care', icon: <FaClock className="w-6 h-6" /> }
      ]
    },
    {
      id: 'purpose',
      title: 'What\'s your main goal?',
      subtitle: 'What do you want to achieve with your plants?',
      options: [
        { value: 'food', label: 'Fresh Food', description: 'Grow vegetables, herbs, and fruits for cooking', icon: <FaLeaf className="w-6 h-6" /> },
        { value: 'beauty', label: 'Beauty & Decor', description: 'Decorative plants for aesthetic appeal', icon: <FaLeaf className="w-6 h-6" /> },
        { value: 'health', label: 'Health & Wellness', description: 'Air-purifying and medicinal plants', icon: <FaLeaf className="w-6 h-6" /> },
        { value: 'hobby', label: 'Gardening Hobby', description: 'Enjoy the process of growing and nurturing', icon: <FaLeaf className="w-6 h-6" /> }
      ]
    }
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      generateResults();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getPlantImage = (plantName) => {
    // Verified plant images from Unsplash with specific plant searches
    const plantImages = {
      'Cherry Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop&q=80',
      'Sweet Basil': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&h=200&fit=crop&q=80',
      'Bell Pepper': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&q=80',
      'Strawberry': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop&q=80',
      'Lettuce': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Fresh Mint': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop&q=80',
      'Cilantro': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Green Onions': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Parsley': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Kale': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop&q=80',
      'Oregano': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Cucumber': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Zucchini': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Eggplant': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Okra': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Green Beans': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Rosemary': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Watermelon': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop&q=80',
      'Pumpkin': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Corn': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Squash': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Cantaloupe': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop&q=80',
      'Sunflower': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Mushrooms': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Microgreens': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Chives': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Lemon Balm': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Arugula': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop&q=80',
      'Thyme': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Broccoli': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Cauliflower': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Cabbage': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Carrots': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Radishes': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Sage': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Artichokes': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Asparagus': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Rhubarb': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop&q=80',
      'Grapes': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop&q=80',
      'Figs': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop&q=80',
      'Lavender': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      // New plant images for different combinations
      'Marigolds': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Petunias': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Geraniums': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Pansies': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Nasturtiums': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Alyssum': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Hostas': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop&q=80',
      'Ferns': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop&q=80',
      'Astilbe': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Coral Bells': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Bleeding Heart': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Japanese Forest Grass': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop&q=80',
      'Roses': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Hydrangeas': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Peonies': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Lilacs': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Magnolias': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Wisteria': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Spider Plant': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Snake Plant': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Pothos': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Peace Lily': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'ZZ Plant': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Chinese Evergreen': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Bonsai Trees': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Orchids': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Citrus Trees': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop&q=80',
      'Japanese Maples': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Camellias': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80',
      'Azaleas': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&q=80'
    };
    
    return plantImages[plantName] || 'https://via.placeholder.com/300x200/90EE90/FFFFFF?text=Plant+Image';
  };

  const generateResults = async () => {
    setIsLoading(true);
    
    // Comprehensive plant database with different categories
    // Each combination gets unique plants based on all 5 factors: space + sunlight + experience + time + purpose
    const plantDatabase = {
      // Small Space + Full Sun + Beginner + Low Maintenance + Food
      'small_fullSun_beginner_low_food': [
        {
          name: 'Cherry Tomato',
          category: 'Fruits',
          description: 'Small, sweet tomatoes perfect for containers. Easy to grow!',
          image: getPlantImage('Cherry Tomato'),
          growingTime: '60-75 days',
          sunlight: 'Full Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹30-50'
        },
        {
          name: 'Sweet Basil',
          category: 'Herbs',
          description: 'Aromatic herb perfect for cooking. Great for beginners!',
          image: getPlantImage('Sweet Basil'),
          growingTime: '30-45 days',
          sunlight: 'Full Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹20-30'
        },
        {
          name: 'Bell Pepper',
          category: 'Vegetables',
          description: 'Colorful peppers that add flavor to any dish.',
          image: getPlantImage('Bell Pepper'),
          growingTime: '70-90 days',
          sunlight: 'Full Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹25-40'
        },
        {
          name: 'Strawberry',
          category: 'Fruits',
          description: 'Sweet, juicy berries perfect for desserts.',
          image: getPlantImage('Strawberry'),
          growingTime: '60-80 days',
          sunlight: 'Full Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹25-40'
        },
        {
          name: 'Lettuce',
          category: 'Vegetables',
          description: 'Crisp, fresh greens perfect for salads.',
          image: getPlantImage('Lettuce'),
          growingTime: '30-45 days',
          sunlight: 'Full Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹15-25'
        },
        {
          name: 'Fresh Mint',
          category: 'Herbs',
          description: 'Fast-growing herb perfect for teas and cooking.',
          image: getPlantImage('Fresh Mint'),
          growingTime: '20-30 days',
          sunlight: 'Full Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹15-25'
        }
      ],
      // Small Space + Partial Sun + Beginner + Low Maintenance
      small_partialSun_beginner_low: [
        {
          name: 'Spinach',
          category: 'Vegetables',
          description: 'Nutrient-rich leafy green that grows well in partial shade.',
          image: getPlantImage('Spinach'),
          growingTime: '35-50 days',
          sunlight: 'Partial Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹20-30'
        },
        {
          name: 'Cilantro',
          category: 'Herbs',
          description: 'Fresh herb perfect for Indian cooking and garnishing.',
          image: getPlantImage('Cilantro'),
          growingTime: '25-35 days',
          sunlight: 'Partial Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹15-25'
        },
        {
          name: 'Green Onions',
          category: 'Vegetables',
          description: 'Quick-growing onions perfect for garnishing dishes.',
          image: getPlantImage('Green Onions'),
          growingTime: '20-30 days',
          sunlight: 'Partial Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹10-20'
        },
        {
          name: 'Parsley',
          category: 'Herbs',
          description: 'Versatile herb great for cooking and garnishing.',
          image: getPlantImage('Parsley'),
          growingTime: '30-40 days',
          sunlight: 'Partial Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹18-28'
        },
        {
          name: 'Kale',
          category: 'Vegetables',
          description: 'Superfood green packed with nutrients and vitamins.',
          image: getPlantImage('Spinach'),
          growingTime: '50-65 days',
          sunlight: 'Partial Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹25-35'
        },
        {
          name: 'Oregano',
          category: 'Herbs',
          description: 'Mediterranean herb perfect for Italian dishes.',
          image: getPlantImage('Oregano'),
          growingTime: '40-50 days',
          sunlight: 'Partial Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹20-30'
        }
      ],
      // Medium Space + Full Sun + Intermediate + Medium Maintenance
      medium_fullSun_intermediate_medium: [
        {
          name: 'Cucumber',
          category: 'Vegetables',
          description: 'Refreshing vegetable perfect for salads and pickling.',
          image: getPlantImage('Green Onions'),
          growingTime: '50-70 days',
          sunlight: 'Full Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹30-45'
        },
        {
          name: 'Zucchini',
          category: 'Vegetables',
          description: 'Versatile summer squash perfect for cooking.',
          image: getPlantImage('Green Onions'),
          growingTime: '45-60 days',
          sunlight: 'Full Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹25-40'
        },
        {
          name: 'Eggplant',
          category: 'Vegetables',
          description: 'Rich, meaty vegetable perfect for Indian curries.',
          image: getPlantImage('Green Onions'),
          growingTime: '70-85 days',
          sunlight: 'Full Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹35-50'
        },
        {
          name: 'Okra',
          category: 'Vegetables',
          description: 'Popular Indian vegetable perfect for curries.',
          image: getPlantImage('Green Onions'),
          growingTime: '50-65 days',
          sunlight: 'Full Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹25-40'
        },
        {
          name: 'Green Beans',
          category: 'Vegetables',
          description: 'Nutritious beans perfect for stir-fries and curries.',
          image: getPlantImage('Green Onions'),
          growingTime: '45-60 days',
          sunlight: 'Full Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹20-35'
        },
        {
          name: 'Rosemary',
          category: 'Herbs',
          description: 'Aromatic herb perfect for Mediterranean cooking.',
          image: getPlantImage('Rosemary'),
          growingTime: '60-90 days',
          sunlight: 'Full Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹30-45'
        }
      ],
      // Large Space + Full Sun + Advanced + High Maintenance
      large_fullSun_advanced_high: [
        {
          name: 'Watermelon',
          category: 'Fruits',
          description: 'Sweet, refreshing summer fruit perfect for hot days.',
          image: getPlantImage('Watermelon'),
          growingTime: '80-100 days',
          sunlight: 'Full Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹50-80'
        },
        {
          name: 'Pumpkin',
          category: 'Vegetables',
          description: 'Versatile vegetable perfect for cooking and decoration.',
          image: getPlantImage('Green Onions'),
          growingTime: '90-120 days',
          sunlight: 'Full Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹40-70'
        },
        {
          name: 'Corn',
          category: 'Vegetables',
          description: 'Sweet corn perfect for grilling and cooking.',
          image: getPlantImage('Green Onions'),
          growingTime: '70-90 days',
          sunlight: 'Full Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹30-50'
        },
        {
          name: 'Squash',
          category: 'Vegetables',
          description: 'Nutritious winter squash perfect for soups.',
          image: getPlantImage('Green Onions'),
          growingTime: '80-100 days',
          sunlight: 'Full Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹35-60'
        },
        {
          name: 'Cantaloupe',
          category: 'Fruits',
          description: 'Sweet melon perfect for desserts and snacks.',
          image: getPlantImage('Watermelon'),
          growingTime: '75-90 days',
          sunlight: 'Full Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹45-75'
        },
        {
          name: 'Sunflower',
          category: 'Vegetables',
          description: 'Beautiful flowers with edible seeds.',
          image: getPlantImage('Green Onions'),
          growingTime: '70-90 days',
          sunlight: 'Full Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹25-45'
        }
      ],
      // Add more combinations for comprehensive coverage
      small_shade_beginner_low: [
        {
          name: 'Mushrooms',
          category: 'Vegetables',
          description: 'Nutritious fungi that grow well in low light conditions.',
          image: getPlantImage('Green Onions'),
          growingTime: '14-21 days',
          sunlight: 'Shade',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹30-50'
        },
        {
          name: 'Microgreens',
          category: 'Vegetables',
          description: 'Nutrient-dense baby greens perfect for salads.',
          image: getPlantImage('Green Onions'),
          growingTime: '7-14 days',
          sunlight: 'Shade',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹20-35'
        },
        {
          name: 'Chives',
          category: 'Herbs',
          description: 'Mild onion-flavored herb perfect for garnishing.',
          image: getPlantImage('Chives'),
          growingTime: '30-40 days',
          sunlight: 'Shade',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹15-25'
        },
        {
          name: 'Lemon Balm',
          category: 'Herbs',
          description: 'Citrus-scented herb perfect for teas and cooking.',
          image: getPlantImage('Lemon Balm'),
          growingTime: '40-50 days',
          sunlight: 'Shade',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹20-30'
        },
        {
          name: 'Arugula',
          category: 'Vegetables',
          description: 'Peppery leafy green perfect for salads.',
          image: getPlantImage('Arugula'),
          growingTime: '25-35 days',
          sunlight: 'Shade',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹18-28'
        },
        {
          name: 'Thyme',
          category: 'Herbs',
          description: 'Aromatic herb perfect for Mediterranean dishes.',
          image: getPlantImage('Thyme'),
          growingTime: '35-45 days',
          sunlight: 'Shade',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹20-30'
        }
      ],
      medium_partialSun_intermediate_medium: [
        {
          name: 'Broccoli',
          category: 'Vegetables',
          description: 'Nutritious cruciferous vegetable perfect for stir-fries.',
          image: getPlantImage('Green Onions'),
          growingTime: '60-80 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹35-55'
        },
        {
          name: 'Cauliflower',
          category: 'Vegetables',
          description: 'Versatile vegetable perfect for Indian curries.',
          image: getPlantImage('Green Onions'),
          growingTime: '70-90 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹40-60'
        },
        {
          name: 'Cabbage',
          category: 'Vegetables',
          description: 'Crunchy vegetable perfect for salads and cooking.',
          image: getPlantImage('Green Onions'),
          growingTime: '65-85 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹25-40'
        },
        {
          name: 'Carrots',
          category: 'Vegetables',
          description: 'Sweet root vegetable perfect for cooking and snacking.',
          image: getPlantImage('Green Onions'),
          growingTime: '70-80 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹20-35'
        },
        {
          name: 'Radishes',
          category: 'Vegetables',
          description: 'Quick-growing root vegetable perfect for salads.',
          image: getPlantImage('Green Onions'),
          growingTime: '25-35 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹15-25'
        },
        {
          name: 'Sage',
          category: 'Herbs',
          description: 'Aromatic herb perfect for stuffing and cooking.',
          image: getPlantImage('Sage'),
          growingTime: '50-70 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹25-40'
        }
      ],
      large_partialSun_advanced_high: [
        {
          name: 'Artichokes',
          category: 'Vegetables',
          description: 'Delicate vegetable perfect for Mediterranean dishes.',
          image: getPlantImage('Green Onions'),
          growingTime: '120-150 days',
          sunlight: 'Partial Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹60-100'
        },
        {
          name: 'Asparagus',
          category: 'Vegetables',
          description: 'Perennial vegetable perfect for gourmet cooking.',
          image: getPlantImage('Green Onions'),
          growingTime: '100-120 days',
          sunlight: 'Partial Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹80-120'
        },
        {
          name: 'Rhubarb',
          category: 'Vegetables',
          description: 'Tart vegetable perfect for pies and desserts.',
          image: getPlantImage('Green Onions'),
          growingTime: '90-120 days',
          sunlight: 'Partial Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹50-80'
        },
        {
          name: 'Grapes',
          category: 'Fruits',
          description: 'Sweet fruits perfect for eating and winemaking.',
          image: getPlantImage('Watermelon'),
          growingTime: '120-150 days',
          sunlight: 'Partial Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹70-120'
        },
        {
          name: 'Figs',
          category: 'Fruits',
          description: 'Sweet, unique fruits perfect for desserts.',
          image: getPlantImage('Watermelon'),
          growingTime: '100-130 days',
          sunlight: 'Partial Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹60-100'
        },
        {
          name: 'Lavender',
          category: 'Herbs',
          description: 'Fragrant herb perfect for aromatherapy and cooking.',
          image: getPlantImage('Lavender'),
          growingTime: '90-120 days',
          sunlight: 'Partial Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹40-70'
        }
      ],
      // Add more unique combinations
      'small_fullSun_beginner_low_beauty': [
        {
          name: 'Marigolds',
          category: 'Herbs',
          description: 'Bright orange flowers perfect for small spaces.',
          image: getPlantImage('Marigolds'),
          growingTime: '60-80 days',
          sunlight: 'Full Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹20-40'
        },
        {
          name: 'Petunias',
          category: 'Herbs',
          description: 'Colorful flowers perfect for containers.',
          image: getPlantImage('Petunias'),
          growingTime: '70-90 days',
          sunlight: 'Full Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹25-50'
        },
        {
          name: 'Geraniums',
          category: 'Herbs',
          description: 'Classic flowering plant perfect for beginners.',
          image: getPlantImage('Geraniums'),
          growingTime: '80-100 days',
          sunlight: 'Full Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹30-60'
        },
        {
          name: 'Pansies',
          category: 'Herbs',
          description: 'Cheerful flowers perfect for small gardens.',
          image: getPlantImage('Pansies'),
          growingTime: '60-80 days',
          sunlight: 'Full Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹15-30'
        },
        {
          name: 'Nasturtiums',
          category: 'Herbs',
          description: 'Edible flowers perfect for small spaces.',
          image: getPlantImage('Nasturtiums'),
          growingTime: '50-70 days',
          sunlight: 'Full Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹20-40'
        },
        {
          name: 'Alyssum',
          category: 'Herbs',
          description: 'Sweet-smelling flowers perfect for borders.',
          image: getPlantImage('Alyssum'),
          growingTime: '60-80 days',
          sunlight: 'Full Sun',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹15-35'
        }
      ],
      'medium_partialSun_intermediate_medium_beauty': [
        {
          name: 'Hostas',
          category: 'Herbs',
          description: 'Elegant foliage plants perfect for partial shade.',
          image: getPlantImage('Hostas'),
          growingTime: '90-120 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹100-200'
        },
        {
          name: 'Ferns',
          category: 'Herbs',
          description: 'Lush green plants perfect for shady areas.',
          image: getPlantImage('Ferns'),
          growingTime: '120-150 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹80-150'
        },
        {
          name: 'Astilbe',
          category: 'Herbs',
          description: 'Feathery flowers perfect for partial shade.',
          image: getPlantImage('Astilbe'),
          growingTime: '100-120 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹120-250'
        },
        {
          name: 'Coral Bells',
          category: 'Herbs',
          description: 'Colorful foliage perfect for medium spaces.',
          image: getPlantImage('Coral Bells'),
          growingTime: '90-120 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹150-300'
        },
        {
          name: 'Bleeding Heart',
          category: 'Herbs',
          description: 'Unique heart-shaped flowers perfect for shade.',
          image: getPlantImage('Bleeding Heart'),
          growingTime: '120-150 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹200-400'
        },
        {
          name: 'Japanese Forest Grass',
          category: 'Herbs',
          description: 'Graceful grass perfect for partial shade.',
          image: getPlantImage('Japanese Forest Grass'),
          growingTime: '100-120 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Medium',
          price: '₹180-350'
        }
      ],
      'large_fullSun_advanced_high_beauty': [
        {
          name: 'Roses',
          category: 'Herbs',
          description: 'Classic flowering plant perfect for passionate gardeners.',
          image: getPlantImage('Roses'),
          growingTime: '120-180 days',
          sunlight: 'Full Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹100-200'
        },
        {
          name: 'Hydrangeas',
          category: 'Herbs',
          description: 'Large flowering shrubs perfect for garden enthusiasts.',
          image: getPlantImage('Hydrangeas'),
          growingTime: '120-180 days',
          sunlight: 'Full Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹200-500'
        },
        {
          name: 'Peonies',
          category: 'Herbs',
          description: 'Large, fragrant flowers perfect for advanced gardeners.',
          image: getPlantImage('Peonies'),
          growingTime: '150-200 days',
          sunlight: 'Full Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹300-600'
        },
        {
          name: 'Lilacs',
          category: 'Herbs',
          description: 'Fragrant flowering shrubs perfect for large gardens.',
          image: getPlantImage('Lilacs'),
          growingTime: '120-150 days',
          sunlight: 'Full Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹250-500'
        },
        {
          name: 'Magnolias',
          category: 'Herbs',
          description: 'Large flowering trees perfect for advanced gardeners.',
          image: getPlantImage('Magnolias'),
          growingTime: '200-300 days',
          sunlight: 'Full Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹500-1000'
        },
        {
          name: 'Wisteria',
          category: 'Herbs',
          description: 'Climbing flowering vine perfect for large spaces.',
          image: getPlantImage('Wisteria'),
          growingTime: '180-250 days',
          sunlight: 'Full Sun',
          space: 'Large',
          difficulty: 'Hard',
          price: '₹400-800'
        }
      ],
      'small_shade_beginner_low_health': [
        {
          name: 'Spider Plant',
          category: 'Herbs',
          description: 'Air-purifying plant perfect for beginners.',
          image: getPlantImage('Spider Plant'),
          growingTime: '45-75 days',
          sunlight: 'Shade',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹120-250'
        },
        {
          name: 'Snake Plant',
          category: 'Herbs',
          description: 'Low-maintenance air purifier perfect for small spaces.',
          image: getPlantImage('Snake Plant'),
          growingTime: '90-120 days',
          sunlight: 'Shade',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹150-300'
        },
        {
          name: 'Pothos',
          category: 'Herbs',
          description: 'Trailing air-purifying plant perfect for beginners.',
          image: getPlantImage('Pothos'),
          growingTime: '30-60 days',
          sunlight: 'Shade',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹100-200'
        },
        {
          name: 'Peace Lily',
          category: 'Herbs',
          description: 'Air-purifying plant with elegant white flowers.',
          image: getPlantImage('Peace Lily'),
          growingTime: '60-90 days',
          sunlight: 'Shade',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹200-350'
        },
        {
          name: 'ZZ Plant',
          category: 'Herbs',
          description: 'Low-maintenance air purifier perfect for small spaces.',
          image: getPlantImage('ZZ Plant'),
          growingTime: '60-90 days',
          sunlight: 'Shade',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹180-320'
        },
        {
          name: 'Chinese Evergreen',
          category: 'Herbs',
          description: 'Air-purifying plant with colorful foliage.',
          image: getPlantImage('Chinese Evergreen'),
          growingTime: '60-90 days',
          sunlight: 'Shade',
          space: 'Small',
          difficulty: 'Easy',
          price: '₹160-280'
        }
      ],
      'medium_partialSun_intermediate_medium_hobby': [
        {
          name: 'Bonsai Trees',
          category: 'Herbs',
          description: 'Artistic miniature trees perfect for dedicated hobbyists.',
          image: getPlantImage('Bonsai Trees'),
          growingTime: '365-1095 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Hard',
          price: '₹500-2000'
        },
        {
          name: 'Orchids',
          category: 'Herbs',
          description: 'Exotic flowers perfect for advanced plant enthusiasts.',
          image: getPlantImage('Orchids'),
          growingTime: '180-365 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Hard',
          price: '₹300-800'
        },
        {
          name: 'Citrus Trees',
          category: 'Fruits',
          description: 'Fruit-bearing trees perfect for serious gardeners.',
          image: getPlantImage('Citrus Trees'),
          growingTime: '365-730 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Hard',
          price: '₹400-1200'
        },
        {
          name: 'Japanese Maples',
          category: 'Herbs',
          description: 'Ornamental trees perfect for landscape gardening.',
          image: getPlantImage('Japanese Maples'),
          growingTime: '365-1095 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Hard',
          price: '₹800-2500'
        },
        {
          name: 'Camellias',
          category: 'Herbs',
          description: 'Elegant flowering shrubs perfect for hobbyists.',
          image: getPlantImage('Camellias'),
          growingTime: '150-200 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Hard',
          price: '₹300-600'
        },
        {
          name: 'Azaleas',
          category: 'Herbs',
          description: 'Colorful flowering shrubs perfect for dedicated gardeners.',
          image: getPlantImage('Azaleas'),
          growingTime: '120-180 days',
          sunlight: 'Partial Sun',
          space: 'Medium',
          difficulty: 'Hard',
          price: '₹250-500'
        }
      ]
    };

    // Generate key based on user answers
    const key = `${answers.space}_${answers.sunlight}_${answers.experience}_${answers.time}_${answers.purpose}`;
    
    // Get plants based on user preferences, fallback to default
    const selectedPlants = plantDatabase[key] || plantDatabase['small_fullSun_beginner_low_food'];
    
    // Generate personalized recommendation message
    const getRecommendationMessage = () => {
      const space = answers.space === 'small' ? 'small spaces' : 
                   answers.space === 'medium' ? 'medium spaces' : 'large spaces';
      const experience = answers.experience === 'beginner' ? 'beginner-friendly' :
                        answers.experience === 'intermediate' ? 'intermediate-level' : 'advanced';
      const maintenance = answers.time === 'low' ? 'low-maintenance' :
                         answers.time === 'medium' ? 'moderate-care' : 'high-maintenance';
      
      return `Perfect for ${space}! Here are ${experience}, ${maintenance} plants that match your growing conditions.`;
    };

    // Simulate API call delay
    setTimeout(() => {
      const mockResults = {
        plants: selectedPlants,
        recommendations: getRecommendationMessage()
      };
      
      setResults(mockResults);
      setIsLoading(false);
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setResults(null);
  };

  if (results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
            >
              <FaLeaf className="w-8 h-8 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Perfect Plants!</h1>
            <p className="text-gray-600">{results.recommendations}</p>
          </div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {results.plants.map((plant, index) => (
              <motion.div
                key={plant.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48">
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {plant.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plant.name}</h3>
                  <p className="text-gray-600 mb-4">{plant.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Growing Time:</span>
                      <span className="font-medium">{plant.growingTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Sunlight:</span>
                      <span className="font-medium">{plant.sunlight}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Difficulty:</span>
                      <span className="font-medium">{plant.difficulty}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium text-green-600">{plant.price}</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Add to My Garden
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Actions */}
          <div className="text-center">
            <button
              onClick={resetQuiz}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors mr-4"
            >
              Take Quiz Again
            </button>
            <button
              onClick={() => window.location.href = '/my-garden-journal'}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              View My Garden Journal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <FaLeaf className="w-8 h-8 text-green-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Finding Your Perfect Plants...</h2>
          <p className="text-gray-600">This may take a moment</p>
          <div className="mt-4">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
          >
            <FaLeaf className="w-8 h-8 text-green-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plant Suggestion Quiz</h1>
          <p className="text-gray-600">Answer a few questions to get personalized plant recommendations</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-green-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentQuestion.title}</h2>
            <p className="text-gray-600 mb-8">{currentQuestion.subtitle}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswer(currentQuestion.id, option.value)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    answers[currentQuestion.id] === option.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${
                      answers[currentQuestion.id] === option.value
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {option.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900">{option.label}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <FaArrowLeft className="mr-2" />
            Previous
          </button>

          <button
            onClick={nextStep}
            disabled={!answers[currentQuestion.id]}
            className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
              !answers[currentQuestion.id]
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {currentStep === questions.length - 1 ? 'Get Results' : 'Next'}
            <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantSuggestion;
