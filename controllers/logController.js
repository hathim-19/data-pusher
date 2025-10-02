const Log = require("/models/Log");
const AccountMember = require("/models/AccountMember");
const { getCache, setCache } = require("../services/cacheService");

exports.getLogs = async (req, res) => {
  try {
    const {
      account_id,
      destination_id,
      status,
      start_date,
      end_date,
      page = 1,
      limit = 10,
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // If account_id is provided, use it, else get all accounts the user has access to
    if (account_id) {
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
      query.account_id = account_id;
    } else {
      const userAccounts = await AccountMember.find({ user_id: req.user._id });
      const accountIds = userAccounts.map((am) => am.account_id);
      query.account_id = { $in: accountIds };
    }

    if (destination_id) {
      query.destination_id = destination_id;
    }

    if (status) {
      query.status = status;
    }

    if (start_date || end_date) {
      query.received_timestamp = {};
      if (start_date) {
        query.received_timestamp.$gte = new Date(start_date);
      }
      if (end_date) {
        query.received_timestamp.$lte = new Date(end_date);
      }
    }

    const cacheKey = `logs:${JSON.stringify(query)}:${page}:${limit}`;
    const cachedLogs = await getCache(cacheKey);

    if (cachedLogs) {
      return res.status(200).json({
        success: true,
        data: cachedLogs,
        fromCache: true,
      });
    }

    const logs = await Log.find(query)
      .populate("account_id", "account_name")
      .populate("destination_id", "url")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ received_timestamp: -1 });

    const total = await Log.countDocuments(query);

    const response = {
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };

    await setCache(cacheKey, response);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching logs",
      error: error.message,
    });
  }
};

exports.getLog = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id)
      .populate("account_id", "account_name")
      .populate("destination_id", "url");

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Log not found",
      });
    }

    // Check if user has access to the account of this log
    const accountMember = await AccountMember.findOne({
      user_id: req.user._id,
      account_id: log.account_id,
    });
    if (!accountMember) {
      return res.status(403).json({
        success: false,
        message: "No access to this log",
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching log",
      error: error.message,
    });
  }
};
