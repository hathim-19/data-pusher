module.exports = {
  ROLES: {
    ADMIN: "Admin",
    NORMAL_USER: "Normal User",
  },

  HTTP_METHODS: ["GET", "POST", "PUT", "PATCH", "DELETE"],

  LOG_STATUS: {
    SUCCESS: "success",
    FAILED: "failed",
  },

  CACHE_KEYS: {
    ACCOUNTS: "accounts",
    DESTINATIONS: "destinations",
    LOGS: "logs",
    USERS: "users",
  },

  RATE_LIMIT: {
    WINDOW_MS: 1000, // 1 second
    MAX_REQUESTS: 5,
  },

  HEADERS: {
    SECRET_TOKEN: "CL-X-TOKEN",
    EVENT_ID: "CL-X-EVENT-ID",
  },

  ERROR_MESSAGES: {
    INVALID_DATA: "Invalid Data",
    UNAUTHORIZED: "Not authorized to access this route",
    FORBIDDEN: "Access denied",
    NOT_FOUND: "Resource not found",
    RATE_LIMIT_EXCEEDED: "Too many requests, please try again later.",
  },

  SUCCESS_MESSAGES: {
    DATA_RECEIVED: "Data Received",
    ACCOUNT_CREATED: "Account created successfully",
    DESTINATION_CREATED: "Destination created successfully",
    USER_CREATED: "User created successfully",
  },
};
