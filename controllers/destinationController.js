const Destination = require("/models/Destination");
const AccountMember = require("/models/AccountMember");
const { deleteCache } = require("../services/cacheService");

exports.createDestination = async (req, res) => {
  try {
    const { account_id, url, http_method, headers } = req.body;

    // Check if user has access to the account
    const accountMember = await AccountMember.findOne({
      user_id: req.user._id,
      account_id,
    });
    if (!accountMember) {
      return res.status(403).json({
        success: false,
        message: "No access to this account",
      });
    }

    const destination = await Destination.create({
      account_id,
      url,
      http_method,
      headers,
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    await deleteCache(`destinations:${account_id}:*`);

    res.status(201).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating destination",
      error: error.message,
    });
  }
};

exports.getDestinations = async (req, res) => {
  try {
    const { account_id, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (account_id) {
      query.account_id = account_id;

      // Check if user has access to this account
      const hasAccess = await AccountMember.findOne({
        user_id: req.user._id,
        account_id,
      });

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No access to this account",
        });
      }
    } else {
      // If no account_id provided, get all accounts the user has access to
      const userAccounts = await AccountMember.find({ user_id: req.user._id });
      const accountIds = userAccounts.map((am) => am.account_id);
      query.account_id = { $in: accountIds };
    }

    const destinations = await Destination.find(query)
      .populate("account_id", "account_name")
      .populate("created_by", "email")
      .populate("updated_by", "email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Destination.countDocuments(query);

    res.status(200).json({
      success: true,
      data: destinations,
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
      message: "Error fetching destinations",
      error: error.message,
    });
  }
};

exports.getDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id)
      .populate("account_id", "account_name")
      .populate("created_by", "email")
      .populate("updated_by", "email");

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    // Check if user has access to the account of this destination
    const accountMember = await AccountMember.findOne({
      user_id: req.user._id,
      account_id: destination.account_id,
    });
    if (!accountMember) {
      return res.status(403).json({
        success: false,
        message: "No access to this destination",
      });
    }

    res.status(200).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching destination",
      error: error.message,
    });
  }
};

exports.updateDestination = async (req, res) => {
  try {
    const { url, http_method, headers } = req.body;

    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    // Check if user has access to the account of this destination
    const accountMember = await AccountMember.findOne({
      user_id: req.user._id,
      account_id: destination.account_id,
    });
    if (!accountMember) {
      return res.status(403).json({
        success: false,
        message: "No access to this destination",
      });
    }

    const updatedDestination = await Destination.findByIdAndUpdate(
      req.params.id,
      {
        url,
        http_method,
        headers,
        updated_by: req.user._id,
      },
      { new: true, runValidators: true }
    );

    await deleteCache(`destinations:${destination.account_id}:*`);

    res.status(200).json({
      success: true,
      data: updatedDestination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating destination",
      error: error.message,
    });
  }
};

exports.deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    // Check if user has access to the account of this destination
    const accountMember = await AccountMember.findOne({
      user_id: req.user._id,
      account_id: destination.account_id,
    });
    if (!accountMember) {
      return res.status(403).json({
        success: false,
        message: "No access to this destination",
      });
    }

    await Destination.findByIdAndDelete(req.params.id);
    await deleteCache(`destinations:${destination.account_id}:*`);

    res.status(200).json({
      success: true,
      message: "Destination deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting destination",
      error: error.message,
    });
  }
};
