const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.status || 500);

  if (err.code === '23505') {
    return res.status(409).json({ message: 'SKU already exists. Duplicate SKU is not allowed.' });
  }

  return res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred.'
  });
};

module.exports = errorHandler;
