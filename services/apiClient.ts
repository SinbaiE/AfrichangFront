const API_BASE_URL = 'http://localhost:5000';

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

