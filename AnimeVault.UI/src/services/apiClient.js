import { API_URL } from "../constants/animeConstants";

/**
 * A lightweight secure fetch wrapper to automate handling authorizations and common API logic.
 */
export async function secureFetch(endpoint, token, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Automate JSON content-type if body is provided and not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    if (typeof options.body === "object") {
      options.body = JSON.stringify(options.body);
    }
  }

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `API Error: ${response.statusText}`);
    }

    // Handle empty responses (like 204 No Content)
    if (response.status === 204) return null;
    
    return await response.json();
  } catch (error) {
    console.error(`[API FETCH ERROR]: ${error.message}`);
    throw error;
  }
}
