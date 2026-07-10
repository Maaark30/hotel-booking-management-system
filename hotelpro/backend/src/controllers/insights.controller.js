const { getHotelInsights } = require('../services/insights.service');

async function getInsights(req, res, next) {
  try {
    const insights = await getHotelInsights();
    return res.status(200).json({ success: true, data: insights });
  } catch (err) {
    next(err);
  }
}

module.exports = { getInsights };