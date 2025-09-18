const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plant name is required'],
    trim: true,
    maxlength: [100, 'Plant name cannot exceed 100 characters']
  },
  scientificName: {
    type: String,
    trim: true,
    maxlength: [150, 'Scientific name cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Plant description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['indoor', 'outdoor', 'succulents', 'herbs', 'flowering', 'foliage'],
    lowercase: true
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['beginner', 'intermediate', 'advanced'],
    lowercase: true
  },
  careInstructions: {
    light: {
      type: String,
      required: [true, 'Light requirements are required'],
      enum: ['low', 'medium', 'high', 'low-medium', 'medium-high'],
      lowercase: true
    },
    water: {
      frequency: {
        type: String,
        required: [true, 'Watering frequency is required'],
        enum: ['daily', 'every-2-days', 'weekly', 'bi-weekly', 'monthly'],
        lowercase: true
      },
      amount: {
        type: String,
        enum: ['light', 'moderate', 'heavy'],
        default: 'moderate'
      }
    },
    humidity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    temperature: {
      min: {
        type: Number,
        default: 15 // Celsius
      },
      max: {
        type: Number,
        default: 30 // Celsius
      }
    },
    fertilizer: {
      frequency: {
        type: String,
        enum: ['never', 'monthly', 'bi-monthly', 'seasonally'],
        default: 'monthly'
      },
      type: {
        type: String,
        enum: ['liquid', 'granular', 'organic', 'slow-release'],
        default: 'liquid'
      }
    }
  },
  features: [{
    type: String,
    enum: [
      'air-purifying',
      'pet-safe',
      'low-maintenance',
      'fast-growing',
      'flowering',
      'fragrant',
      'edible',
      'medicinal',
      'drought-tolerant',
      'low-light',
      'trailing',
      'statement-plant'
    ]
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  size: {
    type: String,
    enum: ['small', 'medium', 'large', 'extra-large'],
    required: [true, 'Size is required']
  },
  potSize: {
    type: String,
    default: '6 inch'
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: {
      type: String,
      lowercase: true,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Create slug from name before saving
plantSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.seo.slug) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Update rating when reviews change
plantSchema.methods.updateRating = function() {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = totalRating / this.reviews.length;
    this.rating.count = this.reviews.length;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }
};

// Indexes for better query performance
plantSchema.index({ category: 1, difficulty: 1 });
plantSchema.index({ 'careInstructions.light': 1 });
plantSchema.index({ features: 1 });
plantSchema.index({ price: 1 });
plantSchema.index({ 'rating.average': -1 });
plantSchema.index({ isActive: 1, isFeatured: -1 });
plantSchema.index({ 'seo.slug': 1 });

module.exports = mongoose.model('Plant', plantSchema);