/**
 * Analytics API service — fetch usage metrics.
 */
import api from './api';

/**
 * Get analytics for current user.
 * @returns {Promise<AnalyticsResponse>}
 */
export async function getAnalytics() {
  const { data } = await api.get('/api/analytics');
  return data;
}
