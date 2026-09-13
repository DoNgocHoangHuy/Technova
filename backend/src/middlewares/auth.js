const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { JWT_SECRET } = require('../config/env');

function getToken(req) {
  return req.cookies.technova_token || req.headers.authorization?.replace('Bearer ', '');
}

exports.auth = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) throw new ApiError(401, 'Authentication required');
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user || !user.isActive) throw new ApiError(401, 'Account is unavailable');
    req.user = user;
    next();
  } catch (e) {
    next(e.statusCode ? e : new ApiError(401, 'Invalid or expired token'));
  }
};

exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Admin access required'));
  next();
};