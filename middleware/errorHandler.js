const errorHandler = (err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
};

module.exports = { errorHandler };