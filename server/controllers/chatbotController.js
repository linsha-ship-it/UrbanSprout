const Plant = require('../models/Plant');
const { AppError } = require('../middlewares/errorHandler');
const { asyncHandler } = require('../middlewares/errorHandler');

// Simple chatbot responses for plant care
const plantCareResponses = {
  watering: {
    keywords: ['water', 'watering', 'how often', 'when to water', 'dry', 'wet'],
    responses: [
      "Most houseplants prefer to dry out slightly between waterings. Check the soil with your finger - if the top inch is dry, it's time to water!",
      "Overwatering is more dangerous than underwatering. Look for signs like yellowing leaves or musty soil smell.",
      "Different plants have different watering needs. Succulents need less water, while tropical plants prefer consistent moisture."
    ]
  },
  light: {
    keywords: ['light', 'lighting', 'sun', 'bright', 'dark', 'window', 'shade'],
    responses: [
      "Most houseplants prefer bright, indirect light. Direct sunlight can burn the leaves of many indoor plants.",
      "If your plant is getting leggy or pale, it might need more light. Consider moving it closer to a window.",
      "Low-light plants like pothos, snake plants, and ZZ plants are great for darker spaces."
    ]
  },
  yellowing: {
    keywords: ['yellow', 'yellowing', 'leaves turning yellow', 'yellow leaves'],
    responses: [
      "Yellow leaves are often a sign of overwatering. Check if the soil is soggy and reduce watering frequency.",
      "Natural aging can cause lower leaves to yellow and drop. This is normal for many plants.",
      "Nutrient deficiency can also cause yellowing. Consider fertilizing during the growing season."
    ]
  },
  pests: {
    keywords: ['bugs', 'pests', 'insects', 'spider mites', 'aphids', 'gnats'],
    responses: [
      "Common houseplant pests include spider mites, aphids, and fungus gnats. Inspect your plants regularly.",
      "Neem oil is a natural pesticide that's safe for most plants. Spray in the evening to avoid leaf burn.",
      "Isolate infected plants to prevent pests from spreading to your other plants."
    ]
  },
  fertilizer: {
    keywords: ['fertilizer', 'fertilize', 'nutrients', 'food', 'feeding'],
    responses: [
      "Most houseplants benefit from monthly fertilizing during spring and summer growing seasons.",
      "Use a balanced, diluted liquid fertilizer. It's better to under-fertilize than over-fertilize.",
      "Stop fertilizing in fall and winter when plant growth slows down."
    ]
  },
  repotting: {
    keywords: ['repot', 'repotting', 'pot', 'root bound', 'bigger pot'],
    responses: [
      "Repot when roots are growing out of drainage holes or the plant seems too big for its pot.",
      "Spring is the best time to repot most plants when they're entering their growing season.",
      "Choose a pot only 1-2 inches larger than the current one. Too big a pot can lead to overwatering."
    ]
  }
};

// @desc    Process chatbot message
// @route   POST /api/chatbot/message
// @access  Public
const processMessage = asyncHandler(async (req, res) => {
  const { message, userId } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Message is required'
    });
  }

  const userMessage = message.toLowerCase().trim();
  let response = "I'm here to help with your plant care questions! Ask me about watering, lighting, pests, fertilizing, or repotting.";
  let suggestions = [];
  let relatedPlants = [];

  // Check for plant care topics
  for (const [topic, data] of Object.entries(plantCareResponses)) {
    if (data.keywords.some(keyword => userMessage.includes(keyword))) {
      response = data.responses[Math.floor(Math.random() * data.responses.length)];
      
      // Add suggestions based on topic
      switch (topic) {
        case 'watering':
          suggestions = [
            "How do I know if I'm overwatering?",
            "What's the best time to water plants?",
            "How much water should I give my plants?"
          ];
          break;
        case 'light':
          suggestions = [
            "What are the best low-light plants?",
            "Can I use grow lights for my plants?",
            "How far should plants be from windows?"
          ];
          break;
        case 'yellowing':
          suggestions = [
            "How do I fix overwatering?",
            "When should I remove yellow leaves?",
            "What nutrients do plants need?"
          ];
          break;
        case 'pests':
          suggestions = [
            "How do I prevent plant pests?",
            "Are there natural pest control methods?",
            "How do I identify common plant pests?"
          ];
          break;
        case 'fertilizer':
          suggestions = [
            "What's the best fertilizer for houseplants?",
            "How often should I fertilize?",
            "Can I make homemade plant fertilizer?"
          ];
          break;
        case 'repotting':
          suggestions = [
            "What soil should I use for repotting?",
            "How do I know when to repot?",
            "What size pot should I choose?"
          ];
          break;
      }
      break;
    }
  }

  // Check for specific plant mentions
  const plantKeywords = ['snake plant', 'pothos', 'monstera', 'fiddle leaf', 'succulent', 'cactus'];
  const mentionedPlant = plantKeywords.find(plant => userMessage.includes(plant));
  
  if (mentionedPlant) {
    try {
      // Find related plants in database
      const searchTerm = mentionedPlant.replace(' ', '.*');
      relatedPlants = await Plant.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { scientificName: { $regex: searchTerm, $options: 'i' } }
        ],
        isActive: true
      }).limit(3).select('name scientificName price images difficulty careInstructions');
    } catch (error) {
      console.error('Error fetching related plants:', error);
    }
  }

  // Check for greeting
  if (['hello', 'hi', 'hey', 'help'].some(greeting => userMessage.includes(greeting))) {
    response = "Hello! 🌱 I'm your plant care assistant. I can help you with watering, lighting, pest control, fertilizing, and repotting questions. What would you like to know?";
    suggestions = [
      "How often should I water my plants?",
      "What are the best plants for low light?",
      "How do I deal with plant pests?",
      "When should I repot my plants?"
    ];
  }

  // Check for plant recommendations
  if (userMessage.includes('recommend') || userMessage.includes('suggest') || userMessage.includes('best plant')) {
    response = "I'd be happy to recommend some plants! What kind of space do you have? Are you looking for low-light plants, easy-care options, or something specific?";
    suggestions = [
      "Best plants for beginners",
      "Low-light indoor plants",
      "Pet-safe plants",
      "Air-purifying plants"
    ];

    try {
      // Get some featured plants as recommendations
      relatedPlants = await Plant.find({ 
        isActive: true, 
        difficulty: 'beginner' 
      }).limit(4).select('name scientificName price images difficulty features');
    } catch (error) {
      console.error('Error fetching plant recommendations:', error);
    }
  }

  res.json({
    success: true,
    data: {
      response,
      suggestions,
      relatedPlants,
      timestamp: new Date().toISOString()
    }
  });
});

// @desc    Get plant care tips
// @route   GET /api/chatbot/tips
// @access  Public
const getCareTips = asyncHandler(async (req, res) => {
  const tips = [
    {
      category: 'Watering',
      tip: "Check soil moisture with your finger before watering. Most plants prefer to dry out slightly between waterings.",
      icon: '💧'
    },
    {
      category: 'Light',
      tip: "Rotate your plants weekly to ensure even growth and prevent them from leaning toward the light source.",
      icon: '☀️'
    },
    {
      category: 'Humidity',
      tip: "Group plants together or use a pebble tray with water to increase humidity around your plants.",
      icon: '💨'
    },
    {
      category: 'Cleaning',
      tip: "Dust plant leaves regularly with a damp cloth to help them photosynthesize more efficiently.",
      icon: '🧽'
    },
    {
      category: 'Observation',
      tip: "Check your plants regularly for signs of pests, disease, or stress. Early detection makes treatment easier.",
      icon: '👀'
    }
  ];

  // Return a random tip
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  res.json({
    success: true,
    data: {
      tip: randomTip,
      allTips: tips
    }
  });
});

// @desc    Get plant identification help
// @route   POST /api/chatbot/identify
// @access  Public
const identifyPlant = asyncHandler(async (req, res) => {
  const { description, characteristics } = req.body;

  if (!description) {
    return res.status(400).json({
      success: false,
      message: 'Plant description is required'
    });
  }

  // Simple plant identification based on keywords
  const identificationGuide = {
    'thick leaves': ['succulent', 'jade plant', 'aloe vera'],
    'heart shaped': ['pothos', 'philodendron', 'monstera'],
    'long thin leaves': ['snake plant', 'spider plant', 'dracaena'],
    'split leaves': ['monstera', 'fiddle leaf fig'],
    'trailing': ['pothos', 'ivy', 'string of pearls'],
    'spiky': ['snake plant', 'aloe vera', 'cactus']
  };

  const desc = description.toLowerCase();
  let possiblePlants = [];

  for (const [characteristic, plants] of Object.entries(identificationGuide)) {
    if (desc.includes(characteristic)) {
      possiblePlants.push(...plants);
    }
  }

  // Remove duplicates
  possiblePlants = [...new Set(possiblePlants)];

  let response = "Based on your description, here are some possible matches:";
  if (possiblePlants.length === 0) {
    response = "I couldn't identify your plant from that description. Try describing the leaf shape, size, or growth pattern.";
    possiblePlants = ['pothos', 'snake plant', 'spider plant']; // Default suggestions
  }

  // Try to find these plants in the database
  let matchingPlants = [];
  try {
    for (const plantName of possiblePlants.slice(0, 3)) {
      const plants = await Plant.find({
        name: { $regex: plantName, $options: 'i' },
        isActive: true
      }).limit(1).select('name scientificName images description careInstructions');
      
      matchingPlants.push(...plants);
    }
  } catch (error) {
    console.error('Error fetching matching plants:', error);
  }

  res.json({
    success: true,
    data: {
      response,
      possibleMatches: possiblePlants,
      plants: matchingPlants,
      suggestions: [
        "Can you describe the leaf shape?",
        "How big is the plant?",
        "Does it have flowers?",
        "Is it a trailing or upright plant?"
      ]
    }
  });
});

// @desc    Get seasonal care advice
// @route   GET /api/chatbot/seasonal
// @access  Public
const getSeasonalAdvice = asyncHandler(async (req, res) => {
  const currentMonth = new Date().getMonth(); // 0-11
  let season, advice;

  if (currentMonth >= 2 && currentMonth <= 4) {
    season = 'Spring';
    advice = {
      title: 'Spring Plant Care',
      tips: [
        'Start fertilizing your plants as they enter their growing season',
        'This is the best time for repotting most houseplants',
        'Increase watering frequency as plants become more active',
        'Begin taking cuttings for propagation'
      ],
      icon: '🌸'
    };
  } else if (currentMonth >= 5 && currentMonth <= 7) {
    season = 'Summer';
    advice = {
      title: 'Summer Plant Care',
      tips: [
        'Water more frequently but check soil moisture first',
        'Provide extra humidity during hot, dry weather',
        'Move plants away from air conditioning vents',
        'Continue regular fertilizing schedule'
      ],
      icon: '☀️'
    };
  } else if (currentMonth >= 8 && currentMonth <= 10) {
    season = 'Fall';
    advice = {
      title: 'Fall Plant Care',
      tips: [
        'Reduce fertilizing as plant growth slows down',
        'Begin reducing watering frequency',
        'Bring outdoor plants inside before first frost',
        'Check for pests that may have developed over summer'
      ],
      icon: '🍂'
    };
  } else {
    season = 'Winter';
    advice = {
      title: 'Winter Plant Care',
      tips: [
        'Water less frequently as plants are dormant',
        'Stop fertilizing until spring',
        'Provide extra light with grow lamps if needed',
        'Keep plants away from cold drafts and heating vents'
      ],
      icon: '❄️'
    };
  }

  res.json({
    success: true,
    data: {
      season,
      advice,
      month: new Date().toLocaleString('default', { month: 'long' })
    }
  });
});

module.exports = {
  processMessage,
  getCareTips,
  identifyPlant,
  getSeasonalAdvice
};