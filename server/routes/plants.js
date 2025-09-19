const express = require('express');
const router = express.Router();
const { suggestPlants, getAllPlants, getPlantById } = require('../controllers/plantController');

// POST /api/plants/suggest - Get plant suggestions based on keyword and preferences
router.post('/suggest', suggestPlants);

// GET /api/plants - Get all plants
router.get('/', getAllPlants);

// GET /api/plants/:id - Get specific plant by name
router.get('/:id', getPlantById);

module.exports = router;
