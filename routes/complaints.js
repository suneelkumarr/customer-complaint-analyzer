const express = require('express');
const { analyzeComplaint } = require('../services/llmService');
const { validateMessage } = require('../middleware/validation');

const router = express.Router();

router.post('/summarize', validateMessage, async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log(`📝 Processing complaint: ${message.substring(0, 100)}...`);
    
    const analysis = await analyzeComplaint(message);
    
    console.log('✅ Analysis completed successfully');
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error('❌ Error analyzing complaint:', error.message);
    
    if (error.message.includes('API key')) {
      return res.status(401).json({ 
        error: 'LLM API authentication failed',
        message: 'Please check your API key configuration'
      });
    }
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Please try again later'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to analyze complaint',
      message: 'An unexpected error occurred while processing your request'
    });
  }
});

module.exports = router;