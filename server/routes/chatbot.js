const express = require('express');
const router = express.Router();

// In-memory session storage (in production, use Redis or database)
const userSessions = new Map();

// Enhanced Plant Database with Local & Exotic Options
const plantDatabase = {
  // Organized by conditions: sunlight_maintenance_space
  combinations: {
    // Low sunlight combinations
    'low_low_small': [
      {
        name: "Lettuce",
        type: "vegetable",
        growTime: "30-45 days",
        maintenance: "low",
        description: "Fast-growing leafy green that tolerates shade",
        image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop",
        tips: ["Harvest outer leaves first", "Keep soil moist", "Perfect for containers"]
      },
      {
        name: "Spinach",
        type: "vegetable", 
        growTime: "40-50 days",
        maintenance: "low",
        description: "Nutritious leafy green for shaded areas",
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop",
        tips: ["Cool weather crop", "Harvest baby leaves", "Succession plant"]
      },
      {
        name: "Green Onions",
        type: "vegetable",
        growTime: "60-90 days",
        maintenance: "low",
        description: "Easy to grow, regrows from kitchen scraps",
        image: "https://images.unsplash.com/photo-1553395572-0b35b5d9b9b5?w=300&h=200&fit=crop",
        tips: ["Regrows from roots", "Harvest green tops", "Very low maintenance"]
      }
    ],
    'low_low_medium': [
      {
        name: "Kale",
        type: "vegetable",
        growTime: "50-65 days",
        maintenance: "low",
        description: "Hardy superfood that grows in partial shade",
        image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=300&h=200&fit=crop",
        tips: ["Cold tolerant", "Harvest outer leaves", "Grows well in containers"]
      },
      {
        name: "Swiss Chard",
        type: "vegetable",
        growTime: "45-60 days", 
        maintenance: "low",
        description: "Colorful leafy green with edible stems",
        image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=200&fit=crop",
        tips: ["Cut and come again", "Colorful varieties", "Heat tolerant"]
      },
      {
        name: "Asian Greens",
        type: "vegetable",
        growTime: "30-50 days",
        maintenance: "low", 
        description: "Bok choy, pak choi - fast growing Asian vegetables",
        image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=300&h=200&fit=crop",
        tips: ["Quick harvest", "Cool season crop", "Great in stir-fries"]
      }
    ],
    'low_medium_large': [
      {
        name: "Rhubarb",
        type: "vegetable",
        growTime: "365+ days",
        maintenance: "medium",
        description: "Perennial vegetable with tart edible stalks",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
        tips: ["Perennial crop", "Harvest stalks not leaves", "Needs winter chill"]
      },
      {
        name: "Asparagus",
        type: "vegetable",
        growTime: "730+ days",
        maintenance: "medium",
        description: "Long-term perennial vegetable investment",
        image: "https://images.unsplash.com/photo-1509963725-c8b3c0e7b5c0?w=300&h=200&fit=crop",
        tips: ["Takes 2-3 years to establish", "Harvest spears in spring", "Long-lived crop"]
      },
      {
        name: "Jerusalem Artichoke",
        type: "vegetable",
        growTime: "120-150 days",
        maintenance: "medium",
        description: "Sunflower relative with edible tubers",
        image: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300&h=200&fit=crop",
        tips: ["Tall plants", "Harvest tubers in fall", "Can spread aggressively"]
      }
    ],

    // Partial sunlight combinations  
    'partial_low_small': [
      {
        name: "Cherry Tomatoes",
        type: "fruit",
        growTime: "60-80 days",
        maintenance: "low",
        description: "Small sweet tomatoes perfect for containers",
        image: "https://images.unsplash.com/photo-1592841200221-21e1c4e6e8e5?w=300&h=200&fit=crop",
        tips: ["Easier than large tomatoes", "Harvest frequently", "Support with stakes"]
      },
      {
        name: "Strawberries",
        type: "fruit",
        growTime: "90-120 days",
        maintenance: "low",
        description: "Sweet berries that tolerate partial shade",
        image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop",
        tips: ["Plant in spring", "Remove runners", "Protect from birds"]
      },
      {
        name: "Herbs Mix",
        type: "herb",
        growTime: "30-60 days",
        maintenance: "low",
        description: "Basil, cilantro, parsley - cooking essentials",
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop",
        tips: ["Harvest regularly", "Pinch flowers", "Great for beginners"]
      }
    ],
    'partial_medium_medium': [
      {
        name: "Guava",
        type: "fruit",
        growTime: "365+ days",
        maintenance: "medium",
        description: "Tropical fruit tree with vitamin C rich fruits",
        image: "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=300&h=200&fit=crop",
        tips: ["Warm climate fruit", "Prune for shape", "Multiple harvests per year"]
      },
      {
        name: "Passion Fruit",
        type: "fruit",
        growTime: "365+ days",
        maintenance: "medium",
        description: "Climbing vine with aromatic exotic fruits",
        image: "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=300&h=200&fit=crop",
        tips: ["Needs trellis support", "Fragrant flowers", "Rich in antioxidants"]
      },
      {
        name: "Okra",
        type: "vegetable",
        growTime: "50-70 days",
        maintenance: "medium",
        description: "Heat-loving vegetable popular in many cuisines",
        image: "https://images.unsplash.com/photo-1583662017845-4bfb0b2b2e8e?w=300&h=200&fit=crop",
        tips: ["Harvest young pods", "Heat tolerant", "Continuous harvest"]
      }
    ],
    'partial_high_large': [
      {
        name: "Dragon Fruit",
        type: "fruit",
        growTime: "730+ days",
        maintenance: "high",
        description: "Exotic cactus fruit with stunning appearance",
        image: "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=300&h=200&fit=crop",
        tips: ["Climbing cactus", "Needs strong support", "Night-blooming flowers"]
      },
      {
        name: "Rambutan",
        type: "fruit", 
        growTime: "1095+ days",
        maintenance: "high",
        description: "Hairy exotic fruit similar to lychee",
        image: "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=300&h=200&fit=crop",
        tips: ["Tropical tree", "Takes 3-5 years to fruit", "High humidity needs"]
      },
      {
        name: "Pumpkin",
        type: "vegetable",
        growTime: "90-120 days",
        maintenance: "high",
        description: "Large sprawling vine with nutritious fruits",
        image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=200&fit=crop",
        tips: ["Needs lots of space", "Regular watering", "Harvest before frost"]
      }
    ],

    // Full sunlight combinations
    'full_low_small': [
      {
        name: "Radishes",
        type: "vegetable",
        growTime: "25-30 days",
        maintenance: "low",
        description: "Fastest growing vegetable, perfect for beginners",
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop",
        tips: ["Direct sow", "Thin seedlings", "Harvest when firm"]
      },
      {
        name: "Microgreens",
        type: "vegetable",
        growTime: "7-14 days",
        maintenance: "low",
        description: "Nutrient-dense baby greens ready in days",
        image: "https://images.unsplash.com/photo-1622207215132-edf4f6f5d8c4?w=300&h=200&fit=crop",
        tips: ["Harvest in 1-2 weeks", "Multiple varieties", "Year-round growing"]
      },
      {
        name: "Chili Peppers",
        type: "vegetable",
        growTime: "70-90 days",
        maintenance: "low",
        description: "Spicy peppers that love heat and sun",
        image: "https://images.unsplash.com/photo-1583662017845-4bfb0b2b2e8e?w=300&h=200&fit=crop",
        tips: ["Heat loving", "Harvest when colored", "Dry for storage"]
      }
    ],
    'full_medium_medium': [
      {
        name: "Papaya",
        type: "fruit",
        growTime: "365+ days",
        maintenance: "medium",
        description: "Fast-growing tropical tree with sweet fruits",
        image: "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=300&h=200&fit=crop",
        tips: ["Fast growing tree", "Male and female plants", "Rich in enzymes"]
      },
      {
        name: "Cucumber",
        type: "vegetable",
        growTime: "50-70 days",
        maintenance: "medium",
        description: "Refreshing climbing vegetable for hot weather",
        image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=300&h=200&fit=crop",
        tips: ["Climbing variety", "Regular watering", "Harvest frequently"]
      },
      {
        name: "Eggplant",
        type: "vegetable",
        growTime: "70-90 days",
        maintenance: "medium",
        description: "Heat-loving vegetable with glossy purple fruits",
        image: "https://images.unsplash.com/photo-1583662017845-4bfb0b2b2e8e?w=300&h=200&fit=crop",
        tips: ["Warm season crop", "Support heavy fruits", "Harvest when glossy"]
      }
    ],
    'full_high_large': [
      {
        name: "Abiu",
        type: "fruit",
        growTime: "1095+ days",
        maintenance: "high",
        description: "Rare tropical fruit with creamy sweet flesh",
        image: "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=300&h=200&fit=crop",
        tips: ["Rare tropical tree", "Takes 3-4 years", "Creamy texture fruit"]
      },
      {
        name: "Jackfruit",
        type: "fruit",
        growTime: "1095+ days",
        maintenance: "high",
        description: "World's largest tree fruit with versatile uses",
        image: "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=300&h=200&fit=crop",
        tips: ["Very large tree", "Massive fruits", "Can be eaten ripe or unripe"]
      },
      {
        name: "Bitter Gourd",
        type: "vegetable",
        growTime: "60-80 days",
        maintenance: "high",
        description: "Medicinal climbing vegetable popular in Asian cuisine",
        image: "https://images.unsplash.com/photo-1583662017845-4bfb0b2b2e8e?w=300&h=200&fit=crop",
        tips: ["Climbing vine", "Medicinal properties", "Harvest young fruits"]
      }
    ]
  }
};

// Enhanced Store Items Database
const storeItems = {
  // Containers based on space
  small: [
    { name: "Small Ceramic Pots", price: "$8-15", description: "Perfect for herbs and small vegetables", category: "container" },
    { name: "Window Box Planters", price: "$12-25", description: "Great for balcony gardening", category: "container" },
    { name: "Hanging Baskets", price: "$10-20", description: "Space-saving vertical growing", category: "container" }
  ],
  medium: [
    { name: "Medium Garden Containers", price: "$20-35", description: "Great for tomatoes and peppers", category: "container" },
    { name: "Raised Planter Boxes", price: "$40-80", description: "Elevated growing for better drainage", category: "container" },
    { name: "Self-Watering Planters", price: "$30-60", description: "Reduces watering frequency", category: "container" }
  ],
  large: [
    { name: "Raised Garden Bed Kit", price: "$80-150", description: "Complete garden bed system", category: "container" },
    { name: "Large Wooden Planters", price: "$60-120", description: "Spacious containers for big plants", category: "container" },
    { name: "Greenhouse Kit", price: "$200-500", description: "Protected growing environment", category: "container" }
  ],

  // Tools based on maintenance level
  basic: [
    { name: "Hand Trowel", price: "$10-20", description: "Essential for planting and transplanting", category: "tool" },
    { name: "Watering Can", price: "$15-25", description: "Gentle watering for seedlings", category: "tool" },
    { name: "Garden Gloves", price: "$8-15", description: "Protect hands while gardening", category: "tool" }
  ],
  intermediate: [
    { name: "Pruning Shears", price: "$15-30", description: "For harvesting and maintenance", category: "tool" },
    { name: "Garden Hoe", price: "$20-40", description: "Weeding and soil cultivation", category: "tool" },
    { name: "Drip Irrigation Kit", price: "$25-50", description: "Automated watering system", category: "tool" }
  ],
  advanced: [
    { name: "Electric Tiller", price: "$100-300", description: "Power tool for soil preparation", category: "tool" },
    { name: "Professional Pruning Set", price: "$50-100", description: "Complete pruning tool collection", category: "tool" },
    { name: "pH Testing Kit", price: "$15-30", description: "Monitor soil acidity levels", category: "tool" }
  ],

  // Fertilizers and soil
  fertilizers: [
    { name: "Organic Compost", price: "$12-20", description: "Natural slow-release fertilizer", category: "fertilizer" },
    { name: "Liquid Plant Food", price: "$8-15", description: "Quick-acting liquid nutrients", category: "fertilizer" },
    { name: "Organic Potting Mix", price: "$15-25", description: "Nutrient-rich soil for containers", category: "soil" },
    { name: "Seed Starting Mix", price: "$10-18", description: "Fine soil perfect for germination", category: "soil" }
  ],

  // Watering solutions
  watering: [
    { name: "Basic Watering Can", price: "$15-25", description: "Traditional watering solution", category: "watering" },
    { name: "Drip Irrigation System", price: "$30-60", description: "Water-efficient automated system", category: "watering" },
    { name: "Soaker Hoses", price: "$20-40", description: "Gentle ground-level watering", category: "watering" },
    { name: "Smart Sprinkler Timer", price: "$40-80", description: "Programmable watering schedule", category: "watering" }
  ]
};

// Conversation Flow Management
const conversationFlows = {
  INITIAL: 'initial',
  SUNLIGHT_QUESTION: 'sunlight_question',
  MAINTENANCE_QUESTION: 'maintenance_question', 
  SPACE_QUESTION: 'space_question',
  RECOMMENDATIONS: 'recommendations'
};

// Session management functions
function getSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      step: conversationFlows.INITIAL,
      data: {},
      timestamp: Date.now()
    });
  }
  return userSessions.get(userId);
}

function updateSession(userId, step, data = {}) {
  const session = getSession(userId);
  session.step = step;
  session.data = { ...session.data, ...data };
  session.timestamp = Date.now();
  userSessions.set(userId, session);
}

// Plant recommendation function based on collected conditions
function getPlantRecommendations(sunlight, maintenance, space) {
  const key = `${sunlight}_${maintenance}_${space}`;
  const plants = plantDatabase.combinations[key];
  
  if (plants && plants.length > 0) {
    return plants;
  }
  
  // Fallback to closest match
  const fallbackKeys = Object.keys(plantDatabase.combinations);
  const closestKey = fallbackKeys.find(k => k.includes(sunlight) || k.includes(maintenance) || k.includes(space));
  
  return plantDatabase.combinations[closestKey] || plantDatabase.combinations['partial_low_small'];
}

// Store item recommendation function
function getStoreRecommendations(space, maintenance) {
  let recommendations = [];
  
  // Add containers based on space
  if (storeItems[space]) {
    recommendations.push(...storeItems[space].slice(0, 2));
  }
  
  // Add tools based on maintenance level
  const toolLevel = maintenance === 'low' ? 'basic' : maintenance === 'medium' ? 'intermediate' : 'advanced';
  if (storeItems[toolLevel]) {
    recommendations.push(...storeItems[toolLevel].slice(0, 2));
  }
  
  // Always add fertilizers and watering
  recommendations.push(...storeItems.fertilizers.slice(0, 2));
  recommendations.push(...storeItems.watering.slice(0, 2));
  
  return recommendations.slice(0, 6);
}

// Message processing function
function processConversationMessage(userId, message) {
  const session = getSession(userId);
  const msg = message.toLowerCase().trim();
  
  // Check for restart keywords
  if (msg.includes('start over') || msg.includes('restart') || msg.includes('begin')) {
    updateSession(userId, conversationFlows.INITIAL, {});
    return {
      message: "Let's start fresh! I'll help you find the perfect plants to grow. 🌱",
      buttons: ["I'm a beginner, give me suggestions", "I want specific recommendations", "Show me quick growing options"],
      step: conversationFlows.INITIAL
    };
  }
  
  switch (session.step) {
    case conversationFlows.INITIAL:
      // Initial conversation starters
      if (msg.includes('beginner') || msg.includes('suggestions') || msg.includes('help')) {
        updateSession(userId, conversationFlows.SUNLIGHT_QUESTION);
        return {
          message: "Great! I'll help you find perfect plants for beginners. First, let me know about your sunlight conditions:",
          buttons: ["Low sunlight (shade/indoor)", "Partial sunlight (morning sun)", "Quite a lot (full sun)"],
          step: conversationFlows.SUNLIGHT_QUESTION
        };
      } else if (msg.includes('specific') || msg.includes('custom')) {
        updateSession(userId, conversationFlows.SUNLIGHT_QUESTION);
        return {
          message: "Perfect! Let's find plants that match your specific needs. What's your sunlight situation?",
          buttons: ["Low sunlight (shade/indoor)", "Partial sunlight (morning sun)", "Quite a lot (full sun)"],
          step: conversationFlows.SUNLIGHT_QUESTION
        };
      } else if (msg.includes('quick') || msg.includes('fast')) {
        updateSession(userId, conversationFlows.SUNLIGHT_QUESTION);
        return {
          message: "Excellent choice! Quick-growing plants are very rewarding. What sunlight do you have available?",
          buttons: ["Low sunlight (shade/indoor)", "Partial sunlight (morning sun)", "Quite a lot (full sun)"],
          step: conversationFlows.SUNLIGHT_QUESTION
        };
      }
      break;
      
    case conversationFlows.SUNLIGHT_QUESTION:
      let sunlight = '';
      if (msg.includes('low') || msg.includes('shade') || msg.includes('indoor')) {
        sunlight = 'low';
      } else if (msg.includes('partial') || msg.includes('morning')) {
        sunlight = 'partial';
      } else if (msg.includes('lot') || msg.includes('full')) {
        sunlight = 'full';
      }
      
      if (sunlight) {
        updateSession(userId, conversationFlows.MAINTENANCE_QUESTION, { sunlight });
        return {
          message: "Perfect! Now, how much time can you dedicate to plant maintenance?",
          buttons: ["Low time (minimal care)", "Medium time (regular care)", "High time (daily attention)"],
          step: conversationFlows.MAINTENANCE_QUESTION
        };
      }
      break;
      
    case conversationFlows.MAINTENANCE_QUESTION:
      let maintenance = '';
      if (msg.includes('low') || msg.includes('minimal')) {
        maintenance = 'low';
      } else if (msg.includes('medium') || msg.includes('regular')) {
        maintenance = 'medium';
      } else if (msg.includes('high') || msg.includes('daily')) {
        maintenance = 'high';
      }
      
      if (maintenance) {
        updateSession(userId, conversationFlows.SPACE_QUESTION, { maintenance });
        return {
          message: "Great! Finally, what's your available growing space?",
          buttons: ["Small balcony/containers", "Medium terrace/patio", "Large garden/yard"],
          step: conversationFlows.SPACE_QUESTION
        };
      }
      break;
      
    case conversationFlows.SPACE_QUESTION:
      let space = '';
      if (msg.includes('small') || msg.includes('balcony') || msg.includes('container')) {
        space = 'small';
      } else if (msg.includes('medium') || msg.includes('terrace') || msg.includes('patio')) {
        space = 'medium';
      } else if (msg.includes('large') || msg.includes('garden') || msg.includes('yard')) {
        space = 'large';
      }
      
      if (space) {
        const { sunlight, maintenance } = session.data;
        const plants = getPlantRecommendations(sunlight, maintenance, space);
        const storeItems = getStoreRecommendations(space, maintenance);
        
        updateSession(userId, conversationFlows.RECOMMENDATIONS, { space });
        
        return {
          message: `Perfect! Based on your conditions (${sunlight} sunlight, ${maintenance} maintenance, ${space} space), here are my top recommendations:`,
          plants: plants,
          storeItems: storeItems,
          buttons: ["Get different suggestions", "Start over", "Ask specific questions"],
          step: conversationFlows.RECOMMENDATIONS
        };
      }
      break;
      
    case conversationFlows.RECOMMENDATIONS:
      if (msg.includes('different') || msg.includes('more')) {
        // Provide alternative recommendations
        const { sunlight, maintenance, space } = session.data;
        const plants = getPlantRecommendations(sunlight, maintenance, space);
        const storeItems = getStoreRecommendations(space, maintenance);
        
        return {
          message: "Here are some alternative suggestions for your conditions:",
          plants: plants,
          storeItems: storeItems,
          buttons: ["Get different suggestions", "Start over", "Ask specific questions"],
          step: conversationFlows.RECOMMENDATIONS
        };
      } else if (msg.includes('start over') || msg.includes('restart')) {
        updateSession(userId, conversationFlows.INITIAL, {});
        return {
          message: "Let's start fresh! What would you like to grow?",
          buttons: ["I'm a beginner, give me suggestions", "I want specific recommendations", "Show me quick growing options"],
          step: conversationFlows.INITIAL
        };
      }
      break;
  }
  
  // Default fallback
  return {
    message: "I didn't quite understand that. Let me help you get started:",
    buttons: ["I'm a beginner, give me suggestions", "I want specific recommendations", "Show me quick growing options"],
    step: conversationFlows.INITIAL
  };
}

// Main chatbot endpoint with conversation flow
router.post('/', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    // Use email as userId if not provided (for session management)
    const sessionId = userId || 'anonymous_' + Date.now();
    
    // Process the conversation message
    const response = processConversationMessage(sessionId, message);
    
    res.json({
      success: true,
      data: {
        message: response.message,
        buttons: response.buttons || [],
        plants: response.plants || [],
        storeItems: response.storeItems || [],
        step: response.step,
        sessionId: sessionId
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing your request',
      error: error.message
    });
  }
});

// Get predefined questions endpoint
router.get('/questions', (req, res) => {
  const predefinedQuestions = [
    "I'm a beginner, give me suggestions",
    "I want specific recommendations", 
    "Show me quick growing options",
    "What exotic fruits can I grow?",
    "I have a small balcony space",
    "I want low maintenance plants",
    "Help me start a vegetable garden"
  ];
  
  res.json({
    success: true,
    data: predefinedQuestions
  });
});

module.exports = router;