const Queue = require("bull");
const axios = require("axios");
const Log = require("/models/Log");
const Destination = require("/models/Destination");

const dataQueue = new Queue("data processing", process.env.REDIS_URL);

dataQueue.process(async (job) => {
  const { accountId, data, eventId } = job.data;

  try {
    const destinations = await Destination.find({ account_id: accountId });

    const promises = destinations.map(async (destination) => {
      const logEntry = new Log({
        event_id: eventId,
        account_id: accountId,
        destination_id: destination._id,
        received_data: data,
        status: "failed", // default to failed, update if successful
      });

      try {
        const config = {
          method: destination.http_method.toLowerCase(),
          url: destination.url,
          headers: Object.fromEntries(destination.headers),
          data: data,
          timeout: 10000,
        };

        await axios(config);

        logEntry.status = "success";
        logEntry.processed_timestamp = new Date();
      } catch (error) {
        logEntry.error_message = error.message;
        logEntry.processed_timestamp = new Date();
      }

      await logEntry.save();
    });

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Queue processing error:", error);
  }
});

const addToQueue = (accountId, data, eventId) => {
  dataQueue.add(
    {
      accountId,
      data,
      eventId,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    }
  );
};

module.exports = { addToQueue };
