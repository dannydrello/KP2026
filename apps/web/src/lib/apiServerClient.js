const API_SERVER_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001' 
  : '/hcgi/api';

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
