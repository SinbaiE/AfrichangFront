import { authorizedFetch } from '@/lib/fetch';

/**
 * A simple API client that uses the authorizedFetch utility
 * to make requests. This provides a consistent interface for
 * making API calls throughout the application.
 */
const apiClient = {
  get: async (url: string) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  post: async (url: string, data: any) => {
  console.log("🔧 POST request to:", `${API_BASE_URL}${url}`);
  console.log("📦 Data:", data);

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la requête POST');
  }

  return response.json();
},

  put: async (url: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  postFormData: async (url: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },
};

export default apiClient;
