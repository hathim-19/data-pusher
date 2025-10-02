const jwt = require("jsonwebtoken");
const User = require("/models/User");
const Role = require("/models/Role");
const AccountMember = require("/models/AccountMember");
const { handleValidationErrors } = require("../middleware/validation");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user: {
        id: user._id,
        email: user.email,
      },
    },
  });
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const user = await User.create({ email, password });

    // Assign Admin role to new signups (as per requirements)
    const adminRole = await Role.findOne({ role_name: "Admin" });
    if (adminRole) {
      // You might want to create a default account here or handle it separately
    }

    createSendToken(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Successfully logged out",
  });
};
