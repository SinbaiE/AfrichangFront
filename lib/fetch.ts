import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/configuration/api';

interface FetchOptions extends RequestInit {
  headers?: HeadersInit & {
    'Content-Type'?: string;
    Authorization?: string;
  };
}

/**
 * A wrapper around the native fetch API that automatically adds
 * the authorization token to the request headers.
 *
 * @param url The URL to fetch, relative to the API_BASE_URL.
 * @param options The options for the fetch request.
 * @returns The response from the server.
 */
export async function authorizedFetch(url: string, options: FetchOptions = {}): Promise<any> {
  const token = await SecureStore.getItemAsync('auth_token');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Merge default headers with custom headers from options
  const headers = { ...defaultHeaders, ...options.headers };

  // For multipart/form-data, we need to let the browser set the Content-Type
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    // Handle cases with no content
    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
