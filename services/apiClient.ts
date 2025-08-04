import * as SecureStore from "expo-secure-store"
import { API_BASE_URL } from "@/configuration/api"

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = await SecureStore.getItemAsync("auth_token")

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Erreur lors de la requête.")
  }

  return response.json()
}
