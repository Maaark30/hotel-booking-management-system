const { getInsightsData } = require('../models/insights.model');

function generateInsights(data) {
  const insights = [];

  // 1. Occupancy projection — simple heuristic based on upcoming confirmed check-ins
  if (data.totalRooms > 0) {
    const projectedOccupied = Math.min(data.occupiedRooms + data.upcomingCheckIns, data.totalRooms);
    const projectedRate = Math.round((projectedOccupied / data.totalRooms) * 100);

    if (data.upcomingCheckIns > 0) {
      insights.push({
        type: 'occupancy',
        text: `Occupancy could reach ${projectedRate}% this week with ${data.upcomingCheckIns} confirmed check-in${data.upcomingCheckIns > 1 ? 's' : ''} coming up.`,
      });
    } else {
      insights.push({
        type: 'occupancy',
        text: `Current occupancy is steady at ${Math.round(data.currentOccupancy)}%, with no confirmed check-ins in the next 7 days.`,
      });
    }
  }

  // 2. Most popular room category
  if (data.popularCategory) {
    insights.push({
      type: 'popularity',
      text: `${data.popularCategory.name}s are your most booked room type, with ${data.popularCategory.booking_count} booking${data.popularCategory.booking_count > 1 ? 's' : ''} recorded.`,
    });
  }

  // 3. Revenue forecast — extrapolate current month-to-date based on day-of-month progress
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  if (data.currentMonthRevenue > 0 && dayOfMonth > 0) {
    const projectedMonthly = (data.currentMonthRevenue / dayOfMonth) * daysInMonth;
    insights.push({
      type: 'revenue',
      text: `At the current pace, revenue is projected to reach approximately ₱${Math.round(projectedMonthly).toLocaleString()} this month.`,
    });
  } else {
    insights.push({
      type: 'revenue',
      text: `No paid revenue recorded yet this month.`,
    });
  }

  // 4. Maintenance / capacity suggestion
  if (data.maintenanceCount > 0) {
    insights.push({
      type: 'suggestion',
      text: `${data.maintenanceCount} room${data.maintenanceCount > 1 ? 's are' : ' is'} currently under maintenance. Resolving this could increase available capacity.`,
    });
  } else if (data.currentOccupancy >= 80) {
    insights.push({
      type: 'suggestion',
      text: `Occupancy is running high. Consider reviewing room pricing or availability to capture additional demand.`,
    });
  }

  return insights;
}

async function getHotelInsights() {
  const data = await getInsightsData();
  return generateInsights(data);
}

module.exports = { getHotelInsights };