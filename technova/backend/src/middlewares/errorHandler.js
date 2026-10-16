exports.notFound = (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
};

exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};