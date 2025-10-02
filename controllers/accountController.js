const Account = require("/models/Account");
const AccountMember = require("/models/AccountMember");
const Role = require("/models/Role");
const { deleteCache } = require("../services/cacheService");

exports.createAccount = async (req, res) => {
  try {
    const { account_name, website } = req.body;

    const account = await Account.create({
      account_id: require("crypto").randomBytes(8).toString("hex"),
      account_name,
      website,
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    // Add creator as Admin member
    const adminRole = await Role.findOne({ role_name: "Admin" });
    await AccountMember.create({
      account_id: account._id,
      user_id: req.user._id,
      role_id: adminRole._id,
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating account",
      error: error.message,
    });
  }
};

exports.getAccounts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.account_name = { $regex: search, $options: "i" };
    }

    // For Normal Users, only show accounts they are members of
    const userAccounts = await AccountMember.find({ user_id: req.user._id });
    const accountIds = userAccounts.map((am) => am.account_id);

    query._id = { $in: accountIds };

    const accounts = await Account.find(query)
      .populate("created_by", "email")
      .populate("updated_by", "email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Account.countDocuments(query);

    res.status(200).json({
      success: true,
      data: accounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching accounts",
      error: error.message,
    });
  }
};

exports.getAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id)
      .populate("created_by", "email")
      .populate("updated_by", "email");

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching account",
      error: error.message,
    });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const { account_name, website } = req.body;

    const account = await Account.findByIdAndUpdate(
      req.params.id,
      {
        account_name,
        website,
        updated_by: req.user._id,
      },
      { new: true, runValidators: true }
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    await deleteCache("accounts:*");

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating account",
      error: error.message,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // Cascade delete related data
    await AccountMember.deleteMany({ account_id: req.params.id });
    await Destination.deleteMany({ account_id: req.params.id });

    await deleteCache("accounts:*");

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message,
    });
  }
};
