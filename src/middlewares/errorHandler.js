import { ApiError } from '../utils/apiError.js';
import { config } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of '${err.value}'`;
    error = new ApiError(404, message);
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = new ApiError(409, message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((val) => ({
      field: val.path,
      message: val.message
    }));
    error = new ApiError(400, 'Invalid input data', errors);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  const responsePayload = {
    success: false,
    message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(config.nodeEnv === 'development' && { stack: error.stack })
  };

  if (statusCode === 500 && config.nodeEnv !== 'test') {
    console.error('[Unhandled Server Error]', err);
  }

  res.status(statusCode).json(responsePayload);
};
