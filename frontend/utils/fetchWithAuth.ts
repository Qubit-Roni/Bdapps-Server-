export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    // Default to JSON if not specified and body exists
    if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
      headers.set("Content-Type", "application/json");
    }

    return fetch(url, {
      ...options,
      headers
    });
  }
  
  return fetch(url, options);
};
