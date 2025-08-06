import authHttpClient from '@/lib/authHttpClient';

/**
 * This is the single entry point for all API calls in the application.
 * It exports the authenticated HTTP client, which includes automatic
 * token injection and error handling.
 *
 * All services should import this client to make API requests.
 */
const apiClient = authHttpClient;

export default apiClient;
