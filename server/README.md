# UrbanSprout Backend API 🌱

A comprehensive Node.js backend API for the UrbanSprout plant care and e-commerce platform.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role management
- **Plant Store** - Complete e-commerce functionality for plants
- **Blog System** - Content management with comments and likes
- **Admin Dashboard** - Full admin panel with analytics
- **AI Chatbot** - Plant care assistance and identification
- **User Preferences** - Personalized plant recommendations
- **Order Management** - Complete order lifecycle tracking

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── blogController.js    # Blog management
│   ├── storeController.js   # E-commerce logic
│   ├── adminController.js   # Admin operations
│   └── chatbotController.js # AI assistant
├── middlewares/
│   ├── auth.js             # Authentication middleware
│   ├── errorHandler.js     # Error handling
│   └── validation.js       # Input validation
├── models/
│   ├── User.js             # User schema
│   ├── Plant.js            # Plant schema
│   ├── Blog.js             # Blog post schema
│   └── Order.js            # Order schema
├── routes/
│   ├── auth.js             # Auth routes
│   ├── blog.js             # Blog routes
│   ├── store.js            # Store routes
│   ├── admin.js            # Admin routes
│   └── chatbot.js          # Chatbot routes
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
├── server.js              # Main server file
└── package.json           # Dependencies
```

## 🔧 Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with:
   ```env
   MONGODB_URI=mongodb+srv://urbansproutAdmin:helloUrbansproutAdmin#123@urbansprout-cluster.cbjm4a6.mongodb.net/?retryWrites=true&w=majority&appName=UrbanSprout-cluster
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=urbansprout_jwt_secret_key_2024_secure_token
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## 🌐 API Endpoints

### Base URL: `http://localhost:5000/api`

### 🔐 Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update profile
- `PUT /auth/change-password` - Change password
- `PUT /auth/preferences` - Update plant preferences
- `POST /auth/logout` - Logout user
- `DELETE /auth/account` - Delete account

### 📝 Blog (`/blog`)
- `GET /blog` - Get all blog posts
- `GET /blog/:id` - Get single post
- `GET /blog/slug/:slug` - Get post by slug
- `GET /blog/categories` - Get categories
- `GET /blog/featured` - Get featured posts
- `POST /blog` - Create post (Admin)
- `PUT /blog/:id` - Update post (Admin)
- `DELETE /blog/:id` - Delete post (Admin)
- `POST /blog/:id/like` - Like/unlike post
- `POST /blog/:id/comments` - Add comment

### 🛒 Store (`/store`)
- `GET /store/plants` - Get all plants
- `GET /store/plants/:id` - Get single plant
- `GET /store/plants/featured` - Get featured plants
- `GET /store/recommendations` - Get personalized recommendations
- `POST /store/plants/:id/reviews` - Add plant review
- `POST /store/orders` - Create order
- `GET /store/orders` - Get user orders
- `GET /store/orders/:id` - Get single order
- `PUT /store/orders/:id/cancel` - Cancel order

### 👨‍💼 Admin (`/admin`)
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/users` - Get all users
- `PUT /admin/users/:id/role` - Update user role
- `DELETE /admin/users/:id` - Delete user
- `POST /admin/plants` - Create plant
- `PUT /admin/plants/:id` - Update plant
- `DELETE /admin/plants/:id` - Delete plant
- `GET /admin/orders` - Get all orders
- `PUT /admin/orders/:id/status` - Update order status

### 🤖 Chatbot (`/chatbot`)
- `POST /chatbot/message` - Process chat message
- `GET /chatbot/tips` - Get care tips
- `POST /chatbot/identify` - Identify plant
- `GET /chatbot/seasonal` - Get seasonal advice

### 🧪 Testing
- `GET /api/test` - Test endpoint
- `GET /api/health` - Health check

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Models

### User Model
- Personal information and preferences
- Authentication credentials
- Plant care preferences for recommendations

### Plant Model
- Complete plant information
- Care instructions and difficulty levels
- Pricing and inventory management
- Customer reviews and ratings

### Blog Model
- Article content and metadata
- Comments and likes system
- SEO optimization fields

### Order Model
- Complete order lifecycle tracking
- Payment and shipping information
- Order status history

## 🛡️ Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Secure error responses
- **CORS Protection** - Configured for frontend origin

## 🚀 Deployment

The API is ready for deployment to:
- **Heroku** - Easy deployment with MongoDB Atlas
- **AWS EC2** - Full control over server environment
- **DigitalOcean** - Cost-effective cloud hosting
- **Vercel** - Serverless deployment option

## 📈 Performance Features

- **Database Indexing** - Optimized queries
- **Pagination** - Efficient data loading
- **Lean Queries** - Reduced memory usage
- **Connection Pooling** - MongoDB connection optimization

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

### Environment Variables
All sensitive configuration is stored in environment variables for security.

## 📞 Support

For questions or issues, please contact the UrbanSprout development team.

---

**UrbanSprout Backend API v1.0.0** 🌱
*Helping plants and people grow together*