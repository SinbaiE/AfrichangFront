import * as SecureStore from 'expo-secure-store';
import httpClient from './httpClient';

interface AuthHttpClient {
  get: <T>(url: string, options?: RequestInit) => Promise<T>;
  post: <T>(url: string, data: any, options?: RequestInit) => Promise<T>;
  put: <T>(url: string, data: any, options?: RequestInit) => Promise<T>;
  delete: <T>(url: string, options?: RequestInit) => Promise<T>;
  postFormData: <T>(url: string, formData: FormData, options?: RequestInit) => Promise<T>;
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Handle 401 Unauthorized for token refresh logic (placeholder)
    if (response.status === 401) {
      // In a real app, you would trigger a token refresh here.
      // For now, we'll just throw a specific error.
      // e.g., await refreshToken(); and then retry the original request.
      console.error('Authentication error: Token may be expired.');
      // Potentially navigate to login screen
    }

    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  // Handle cases with no content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const authHttpClient: AuthHttpClient = {
  get: async (url, options = {}) => {
    const token = await SecureStore.getItemAsync('auth_token');
    const response = await httpClient(url, {
      ...options,
      method: 'GET',
      headers: {
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },

  post: async (url, data, options = {}) => {
    const token = await SecureStore.getItemAsync('auth_token');
    const response = await httpClient(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },

  put: async (url, data, options = {}) => {
    const token = await SecureStore.getItemAsync('auth_token');
    const response = await httpClient(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },

  delete: async (url, options = {}) => {
    const token = await SecureStore.getItemAsync('auth_token');
    const response = await httpClient(url, {
      ...options,
      method: 'DELETE',
      headers: {
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  },

  postFormData: async (url, formData, options = {}) => {
    const token = await SecureStore.getItemAsync('auth_token');
    const response = await httpClient(url, {
        ...options,
        method: 'POST',
        body: formData,
        headers: {
            // Let the browser set the Content-Type for FormData
            ...options.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    return handleResponse(response);
  },
};

export default authHttpClient;
