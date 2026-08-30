const express = require('express');
const router = express.Router();
const { generateAIResponse, scanMealImage } = require('../controllers/aiController');

// POST /api/v1/ai/generate
router.post('/generate', generateAIResponse);

// POST /api/v1/ai/scan
// Increased limit for base64 images
router.post('/scan', express.json({limit: '10mb'}), scanMealImage);

module.exports = router;
