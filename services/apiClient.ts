
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

// export default apiClient;

// import * as SecureStore from "expo-secure-store"
// import { API_BASE_URL } from "@/configuration/api"

// export const fetchWithAuth = async (
//   url: string,
//   options: RequestInit = {}
// ) => {
//   const token = await SecureStore.getItemAsync("auth_token")

//   const headers: HeadersInit = {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     ...options.headers,
//   }

//   const response = await fetch(`${API_BASE_URL}${url}`, {
//     ...options,
//     headers,
//   })

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}))
//     throw new Error(errorData.message || "Erreur lors de la requête.")
//   }

//   return response.json()
// }

