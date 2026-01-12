export function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    const errors = {};
    for (const field in err.errors) {
      errors[field] = err.errors[field].message;
    }
    return res.status(400).json({ errors });
  }
  
  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ 
      message: `${field} sudah digunakan`
    });
  }
  
  // Handle custom errors
  if (err.message) {
    return res.status(err.statusCode || 400).json({ 
      message: err.message 
    });
  }
  
  // Default error handler
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}