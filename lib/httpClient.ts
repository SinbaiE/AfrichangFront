import { API_BASE_URL } from '@/configuration/api';

/**
 * A simple, unauthenticated HTTP client that wraps the native fetch API.
 * Its primary role is to prepend the API base URL and set default headers.
 *
 * @param endpoint The API endpoint to call (e.g., '/users').
 * @param options The fetch options (method, body, custom headers, etc.).
 * @returns A promise that resolves with the fetch Response object.
 */
const httpClient = (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  return fetch(`${API_BASE_URL}${endpoint}`, config);
};

export default httpClient;
