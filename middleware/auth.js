const jwt = require("jsonwebtoken");
const User = require("/models/User");
const AccountMember = require("/models/AccountMember");
const Role = require("/models/Role");

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

const authorize = (...roles) => {
  return async (req, res, next) => {
    const role = await Role.findOne({ role_name: { $in: roles } });

    if (!role) {
      return res.status(403).json({
        success: false,
        message: "Role not found",
      });
    }

    const accountMember = await AccountMember.findOne({
      user_id: req.user._id,
      role_id: role._id,
    });

    if (!accountMember && !roles.includes("Admin")) {
      return res.status(403).json({
        success: false,
        message: `User role ${roles.join(
          ", "
        )} is not authorized to access this route`,
      });
    }

    next();
  };
};

const checkAccountAccess = async (req, res, next) => {
  try {
    const accountId = req.params.accountId || req.body.account_id;
    const accountMember = await AccountMember.findOne({
      user_id: req.user._id,
      account_id: accountId,
    }).populate("role_id");

    if (!accountMember) {
      return res.status(403).json({
        success: false,
        message: "No access to this account",
      });
    }

    req.accountMember = accountMember;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }
};

module.exports = { protect, authorize, checkAccountAccess };
