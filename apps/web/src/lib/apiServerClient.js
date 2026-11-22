// The backend runs on Supabase Edge Functions.
// Local dev target assumes `supabase start` + `supabase functions serve` (http://127.0.0.1:54321).
const API_SERVER_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:54321/functions/v1'
  : import.meta.env.VITE_API_URL || 'https://your-project-ref.supabase.co/functions/v1';

const apiServerClient = {
    // Callers pass Express-style paths like '/api/payment/config'; translate to the
    // Supabase Edge Function route (function name 'payment', no '/api' prefix).
    fetch: async (url, options = {}) => {
        const functionPath = url.replace(/^\/api/, '');
        return await window.fetch(API_SERVER_URL + functionPath, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          }
        });
    }
};

export default apiServerClient;

export { apiServerClient };
