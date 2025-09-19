const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  authorEmail: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  excerpt: {
    type: String,
    maxlength: 300
  },
  image: {
    type: String,
    default: null
  },
  author: {
    type: String,
    required: true
  },
  authorEmail: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    enum: ['question', 'success_story'],
    required: false
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  likes: [{
    userEmail: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarks: [{
    userEmail: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    userEmail: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt field before saving
blogSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

// Virtual for like count
blogSchema.virtual('likeCount').get(function() {
  return this.likes.length
})

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
  return this.comments.length
})

// Virtual for bookmark count
blogSchema.virtual('bookmarkCount').get(function() {
  return this.bookmarks.length
})

// Virtual for share count
blogSchema.virtual('shareCount').get(function() {
  return this.shares.length
})

// Ensure virtual fields are serialized
blogSchema.set('toJSON', { virtuals: true })

// Use the exact collection name "blogs" in MongoDB (database: test)
module.exports = mongoose.model('Blog', blogSchema, 'blogs')