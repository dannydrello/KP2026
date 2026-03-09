const API_SERVER_URL = import.meta.env.DEV 
  ? 'http://localhost:3001' 
  : import.meta.env.VITE_API_URL || 'https://your-vercel-api-url-here';

const apiServerClient = {
    fetch: async (url, options = {}) => {
        return await window.fetch(API_SERVER_URL + url, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          }
        });
    }
};

export default apiServerClient;

export { apiServerClient };
