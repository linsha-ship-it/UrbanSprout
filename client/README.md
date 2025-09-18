# UrbanSprout Frontend

A modern React application for urban gardening enthusiasts, built with Vite, TailwindCSS, and Framer Motion.

## 🌱 Features

- **Modern Tech Stack**: React 19 + Vite + TailwindCSS + Framer Motion
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Starbucks-Inspired Theme**: Dark green and cream color palette
- **Smooth Animations**: Framer Motion for delightful user interactions
- **Complete Routing**: React Router DOM with 7 main routes
- **Component Library Ready**: shadcn/ui integration setup

## 🚀 Pages & Routes

- **Home (`/`)**: Hero section with nextwork.org-inspired design and interactive slider
- **Login (`/login`)**: User authentication with social login options
- **Signup (`/signup`)**: User registration with form validation
- **Blog (`/blog`)**: Plant care articles and gardening tips
- **Plant Suggestion (`/plant-suggestion`)**: Interactive quiz for personalized plant recommendations
- **Store (`/store`)**: E-commerce interface for plants and accessories
- **Admin (`/admin`)**: Dashboard for managing products, orders, and users

## 🎨 Design System

### Color Palette
- **Forest Green**: Primary brand color (#00704a)
- **Cream**: Secondary/accent color (#f4e4c1)
- **Gradients**: Various green-to-cream combinations

### Components
- **Navbar**: Responsive navigation with mobile menu
- **Footer**: Comprehensive site footer with links and contact info
- **Reusable UI**: Consistent styling across all pages

## 🛠️ Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## 📦 Dependencies

### Core
- React 19.1.1
- React DOM 19.1.1
- React Router DOM 7.8.1

### Styling & Animation
- TailwindCSS 4.1.12
- Framer Motion 12.23.12
- tailwindcss-animate 1.0.7

### UI & Icons
- Lucide React 0.539.0
- clsx 2.1.1
- tailwind-merge 3.3.1

### Development
- Vite 7.1.2
- ESLint 9.33.0
- PostCSS 8.5.6
- Autoprefixer 10.4.21

## 🏗️ Project Structure

```
src/
├── components/
│   └── layout/
│       ├── Navbar.jsx
│       └── Footer.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Blog.jsx
│   ├── PlantSuggestion.jsx
│   ├── Store.jsx
│   └── Admin.jsx
├── lib/
│   └── utils.js
├── App.jsx
├── main.jsx
└── index.css
```

## 🎯 Key Features

### Home Page
- Hero section with gradient background
- Interactive 3-button slider (About Us, What We Do, Start Planting)
- Responsive design with mobile optimization
- Smooth scroll animations

### Plant Suggestion
- Multi-step questionnaire
- Dynamic plant recommendations
- Progress tracking
- Personalized results

### Store
- Product grid/list view toggle
- Advanced filtering and sorting
- Shopping cart integration ready
- Product detail views

### Admin Dashboard
- Statistics overview
- Order management
- Product management
- User analytics

## 🔧 Configuration

### TailwindCSS
Custom theme with Starbucks-inspired colors and shadcn/ui integration.

### Vite
Optimized build configuration with path aliases for clean imports.

### ESLint
React-specific linting rules for code quality.

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📱 Responsive Breakpoints

- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

## 🚀 Deployment

The application is ready for deployment to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for urban gardening enthusiasts