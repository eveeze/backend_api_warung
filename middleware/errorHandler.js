// /middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(`Error: ${err.message}`); // Logs error for debugging

  // Respond with a consistent error format
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Server error",
      code: err.code || 500,
    },
  });
}

module.exports = errorHandler;
