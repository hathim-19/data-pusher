const crypto = require("crypto");

// Generate unique IDs
const generateUniqueId = (length = 8) => {
  return crypto.randomBytes(length).toString("hex");
};

// Generate app secret token
const generateAppSecretToken = () => {
  return `sk_${crypto.randomBytes(32).toString("hex")}`;
};

// Generate event ID
const generateEventId = () => {
  return `evt_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate URL format
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Sanitize object - remove undefined and null values
const sanitizeObject = (obj) => {
  const sanitized = { ...obj };
  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === undefined || sanitized[key] === null) {
      delete sanitized[key];
    }
  });
  return sanitized;
};

// Format API response
const formatResponse = (success, message, data = null, pagination = null) => {
  const response = {
    success,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (pagination !== null) {
    response.pagination = pagination;
  }

  return response;
};

// Calculate pagination
const getPagination = (page, limit, total) => {
  const currentPage = parseInt(page);
  const pageSize = parseInt(limit);
  const totalPages = Math.ceil(total / pageSize);

  return {
    page: currentPage,
    limit: pageSize,
    total,
    pages: totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  generateUniqueId,
  generateAppSecretToken,
  generateEventId,
  isValidEmail,
  isValidUrl,
  sanitizeObject,
  formatResponse,
  getPagination,
  deepClone,
  delay,
};
