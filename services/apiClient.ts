import { authorizedFetch } from '@/lib/fetch';

/**
 * A simple API client that uses the authorizedFetch utility
 * to make requests. This provides a consistent interface for
 * making API calls throughout the application.
 */
const apiClient = {
  get: (url: string, options = {}) => {
    return authorizedFetch(url, { ...options, method: 'GET' });
  },

  post: (url: string, data: any, options = {}) => {
    return authorizedFetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put: (url: string, data: any, options = {}) => {
    return authorizedFetch(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (url: string, options = {}) => {
    return authorizedFetch(url, { ...options, method: 'DELETE' });
  },

  // A special method for multipart/form-data uploads
  postFormData: (url: string, formData: FormData, options = {}) => {
    return authorizedFetch(url, {
      ...options,
      method: 'POST',
      body: formData,
    });
  },
};

export default apiClient;
