const { client } = require("../config/redis");

const cacheDuration = 300; // 5 minutes

const getCache = async (key) => {
  try {
    const cachedData = await client.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
};

const setCache = async (key, data) => {
  try {
    await client.setEx(key, cacheDuration, JSON.stringify(data));
  } catch (error) {
    console.error("Cache set error:", error);
  }
};

const deleteCache = async (pattern) => {
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error("Cache delete error:", error);
  }
};

module.exports = { getCache, setCache, deleteCache };
