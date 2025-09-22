import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaLeaf, FaArrowLeft, FaPlus, FaCalendar } from 'react-icons/fa';

const MyGardenJournal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [garden, setGarden] = useState([]);
  const [filteredGarden, setFilteredGarden] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [plantImages, setPlantImages] = useState({});

  const filters = ['All', 'Herbs', 'Fruits', 'Vegetables'];

  // Load garden from localStorage
  useEffect(() => {
    const loadGarden = () => {
      const key = `my_garden_${user?.id || user?.uid || user?.email || 'guest'}`;
      const savedGarden = localStorage.getItem(key);
      if (savedGarden) {
        try {
          const gardenData = JSON.parse(savedGarden);
          setGarden(gardenData);
          setFilteredGarden(gardenData);
        } catch (error) {
          console.error('Error loading garden:', error);
        }
      } else {
        // Add some sample plants for demonstration
        const samplePlants = ['Sweet Basil', 'Cherry Tomato', 'Fresh Mint'];
        setGarden(samplePlants);
        setFilteredGarden(samplePlants);
        
        // Save sample plants to localStorage
        localStorage.setItem(key, JSON.stringify(samplePlants));
        
        // Add sample images
        const imageKey = `plant_images_${user?.id || user?.uid || user?.email || 'guest'}`;
        const sampleImages = {
          'Sweet Basil': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&h=200&fit=crop',
          'Cherry Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop',
          'Fresh Mint': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop'
        };
        localStorage.setItem(imageKey, JSON.stringify(sampleImages));
      }
    };

    loadGarden();
  }, [user]);

  // Load plant images from localStorage
  useEffect(() => {
    const loadPlantImages = () => {
      const key = `plant_images_${user?.id || user?.uid || user?.email || 'guest'}`;
      const savedImages = localStorage.getItem(key);
      if (savedImages) {
        try {
          const images = JSON.parse(savedImages);
          setPlantImages(images);
        } catch (error) {
          console.error('Error loading plant images:', error);
        }
      }
    };

    loadPlantImages();
  }, [user]);

  // Filter plants based on selected filter
  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredGarden(garden);
    } else {
      // For now, we'll categorize plants based on their names
      // In a real app, you'd have plant type data
      const filtered = garden.filter(plantName => {
        const name = plantName.toLowerCase();
        switch (activeFilter) {
          case 'Herbs':
            return name.includes('basil') || name.includes('mint') || name.includes('oregano') || 
                   name.includes('thyme') || name.includes('rosemary') || name.includes('sage') ||
                   name.includes('cilantro') || name.includes('parsley') || name.includes('dill');
          case 'Fruits':
            return name.includes('tomato') || name.includes('strawberry') || name.includes('berry') ||
                   name.includes('apple') || name.includes('citrus') || name.includes('lemon') ||
                   name.includes('lime') || name.includes('orange');
          case 'Vegetables':
            return name.includes('lettuce') || name.includes('spinach') || name.includes('carrot') ||
                   name.includes('pepper') || name.includes('cucumber') || name.includes('onion') ||
                   name.includes('garlic') || name.includes('broccoli') || name.includes('cabbage');
          default:
            return true;
        }
      });
      setFilteredGarden(filtered);
    }
  }, [activeFilter, garden]);

  const handlePlantClick = (plantName) => {
    navigate(`/plant-detail/${encodeURIComponent(plantName)}`);
  };

  const getPlantImage = (plantName) => {
    // Use sample images for common plants
    const sampleImages = {
      'Sweet Basil': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&h=200&fit=crop',
      'Cherry Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop',
      'Fresh Mint': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop',
      'Lettuce': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop',
      'Bell Pepper': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
      'Strawberry': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop'
    };
    
    return plantImages[plantName] || sampleImages[plantName] || 'https://via.placeholder.com/300x200/90EE90/FFFFFF?text=Plant+Image';
  };

  const getPlantStatus = (plantName) => {
    // For now, return a random status. In a real app, this would come from plant data
    const statuses = ['Growing', 'Planted', 'Harvested'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const getPlantDescription = (plantName) => {
    // Simple descriptions based on plant names
    const descriptions = {
      'Sweet Basil': 'Aromatic herb perfect for cooking. Great for beginners!',
      'Cherry Tomato': 'Small, sweet tomatoes that are easy to grow indoors.',
      'Fresh Mint': 'Fast-growing herb perfect for teas and cooking.',
      'Lettuce': 'Crisp, fresh greens perfect for salads.',
      'Bell Pepper': 'Colorful peppers that add flavor to any dish.',
      'Strawberry': 'Sweet, juicy berries perfect for desserts.'
    };
    return descriptions[plantName] || 'A wonderful addition to your garden!';
  };

  const getAddedDate = (plantName) => {
    // For now, return a random recent date
    const dates = ['Jan 15, 2024', 'Jan 10, 2024', 'Jan 8, 2024', 'Jan 12, 2024', 'Jan 5, 2024', 'Jan 3, 2024'];
    return dates[Math.floor(Math.random() * dates.length)];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft className="text-gray-600" />
              </button>
              <div className="flex items-center">
                <FaLeaf className="text-green-600 text-2xl mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Garden Journal</h1>
                  <p className="text-gray-600">Track your plants, progress, and memories</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Options */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Plant Grid */}
        {filteredGarden.length === 0 ? (
          <div className="text-center py-16">
            <FaLeaf className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No plants found</h3>
            <p className="text-gray-600 mb-6">
              {activeFilter === 'All' 
                ? "Start by adding plants to your garden from the Plant Suggestion assistant!"
                : `No ${activeFilter.toLowerCase()} found in your garden.`
              }
            </p>
            <button
              onClick={() => navigate('/plant-suggestion')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Find Plants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGarden.map((plantName) => (
              <div
                key={plantName}
                onClick={() => handlePlantClick(plantName)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              >
                {/* Plant Image */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={getPlantImage(plantName)}
                    alt={plantName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200/90EE90/FFFFFF?text=Plant+Image';
                    }}
                  />
                  {/* Status Tag */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getPlantStatus(plantName) === 'Growing' 
                        ? 'bg-green-100 text-green-700'
                        : getPlantStatus(plantName) === 'Planted'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {getPlantStatus(plantName)}
                    </span>
                  </div>
                </div>

                {/* Plant Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{plantName}</h3>
                  <p className="text-gray-600 text-sm mb-3">{getPlantDescription(plantName)}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <FaCalendar className="mr-1" />
                    <span>Added {getAddedDate(plantName)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>


      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/plant-suggestion')}
        className="fixed bottom-6 right-6 bg-green-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
      >
        <FaPlus className="text-xl" />
      </button>
    </div>
  );
};

export default MyGardenJournal;
