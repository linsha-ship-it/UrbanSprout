# 🌱 UrbanSprout - My Garden Journal

A modern web application for tracking plants, progress, and gardening memories.

## ✨ Features

### 🏠 Dashboard
- Clean, focused interface with My Garden Journal card
- Direct navigation to plant tracking

### 📖 My Garden Journal
- **Plant Grid View**: Beautiful photo grid of all your plants
- **Smart Filtering**: Filter by Herbs, Fruits, and Vegetables
- **Plant Details**: Click any plant to see detailed information
- **Sample Data**: Pre-loaded with sample plants for demonstration

### 🌿 Plant Detail Pages
- **Growth Timeline**: Track your plant's journey with notes and dates
- **Add Growth Notes**: Document milestones and observations
- **Care Reminders**: Interactive reminders for watering, sunlight, and pruning
- **Image Upload**: Upload and manage plant photos
- **Status Tracking**: Monitor plant growth stages

### 🤖 Plant Suggestion Chatbot
- **AI-Powered Recommendations**: Get personalized plant suggestions
- **Add to Garden**: One-click addition to your journal
- **Image Integration**: Automatically saves plant images

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd UrbanSprout-main
   ./setup.sh
   ```

2. **Start the Application**
   
   **Terminal 1 - Backend Server:**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 - Frontend Client:**
   ```bash
   cd client
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
UrbanSprout-main/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MyGardenJournal.jsx    # Main journal page
│   │   │   ├── PlantDetail.jsx        # Plant detail view
│   │   │   └── dashboard/
│   │   │       └── BeginnerDashboard.jsx
│   │   ├── components/
│   │   │   └── PlantChatbot.jsx       # Enhanced chatbot
│   │   └── App.jsx                    # Updated routing
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
├── .env                    # Environment configuration
└── setup.sh               # Automated setup script
```

## 🎯 Key Components

### My Garden Journal (`/my-garden-journal`)
- Responsive grid layout
- Filtering by plant categories
- Sample plant data with images
- Navigation to plant details

### Plant Detail (`/plant-detail/:plantId`)
- Growth timeline with sample notes
- Interactive care reminders
- Image upload functionality
- Status and category display

### Enhanced Dashboard
- Removed unnecessary cards
- Added My Garden Journal navigation
- Clean, focused interface

## 🔧 Configuration

The project uses a MongoDB cloud database by default. The `.env` file contains:

```env
MONGODB_URI=mongodb+srv://urbansprout:urbansprout123@cluster0.mongodb.net/urbansprout
PORT=5000
NODE_ENV=development
JWT_SECRET=urbansprout_jwt_secret_key_2024
```

## 📱 Features Implemented

✅ **Dashboard Modifications**
- Removed Plant Care, Guides, Community, Ask Expert cards
- Added My Garden Journal card with navigation

✅ **My Garden Journal Page**
- Plant photo grid with status tags
- Filtering: All, Herbs, Fruits, Vegetables
- Sample plant data and images
- Responsive design

✅ **Plant Detail Page**
- Growth timeline with sample notes
- Add growth note functionality
- Interactive care reminders
- Image upload capability
- Plant information display

✅ **Enhanced Functionality**
- Data persistence with localStorage
- Interactive buttons and navigation
- Sample images from Unsplash
- Real file upload for images

## 🎨 Design Features

- **Modern UI**: Clean, green-themed design
- **Responsive**: Works on mobile, tablet, and desktop
- **Interactive**: All buttons and filters are functional
- **Sample Data**: Pre-loaded with realistic plant information
- **Image Integration**: High-quality plant photos

## 🔄 Data Flow

1. **Plant Addition**: Users add plants via Plant Suggestion chatbot
2. **Image Storage**: Plant images are saved to localStorage
3. **Journal Display**: Plants appear in My Garden Journal grid
4. **Detail View**: Clicking plants shows detailed information
5. **Progress Tracking**: Users can add notes and update reminders

## 🚀 Ready to Use

The application is fully functional with:
- Sample plants pre-loaded
- Working navigation between pages
- Interactive features and data persistence
- Modern, responsive design
- Complete plant tracking workflow

Start exploring your garden journal today! 🌱