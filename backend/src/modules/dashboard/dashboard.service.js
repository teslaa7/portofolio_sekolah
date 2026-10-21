'use strict';

const {
  getPortfolioSummary,
  getCategoriesCount,
  getMajorChartData,
  getLatestPortfolios,
} = require('./dashboard.repository');

async function getDashboardSummary(db) {
  const [summary, categoriesCount, majorChartData, latestPortfolios] = await Promise.all([
    getPortfolioSummary(db),
    getCategoriesCount(db),
    getMajorChartData(db),
    getLatestPortfolios(db),
  ]);

  return {
    summary: { ...summary, categoriesCount },
    majorChartData,
    latestPortfolios,
  };
}

module.exports = { getDashboardSummary };
