const validateMessage = (req, res, next) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Message field is required'
    });
  }
  
  if (typeof message !== 'string') {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Message must be a string'
    });
  }
  
  if (message.trim().length === 0) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Message cannot be empty'
    });
  }
  
  if (message.length > 5000) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Message too long (max 5000 characters)'
    });
  }
  
  next();
};

module.exports = { validateMessage };