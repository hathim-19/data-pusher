const Account = require("/models/Account");
const { addToQueue } = require("/services/queueService");

exports.receiveData = async (req, res) => {
  try {
    const secretToken = req.headers["cl-x-token"];
    const eventId = req.headers["cl-x-event-id"];

    if (!secretToken || !eventId) {
      return res.status(400).json({
        success: false,
        message: "Missing CL-X-TOKEN or CL-X-EVENT-ID headers",
      });
    }

    if (typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON data",
      });
    }

    const account = await Account.findOne({ app_secret_token: secretToken });
    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Invalid secret token",
      });
    }

    // Add to queue for async processing
    addToQueue(account._id, req.body, eventId);

    res.status(200).json({
      success: true,
      message: "Data Received",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing data",
      error: error.message,
    });
  }
};
