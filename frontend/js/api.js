// Same-origin API: frontend and backend are served by the same Express server.
// This also makes the app work without Live Server.
const API_BASE_URL = '/api';

async function api(path, options = {}) {
  const config = { ...options, credentials: 'include' };

  config.headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, config);
  let payload = null;

  try {
    payload = await response.json();
  } catch (_) {
    // Keep a useful error even if the server does not return JSON.
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return payload;
}

window.api = api;
window.API_BASE_URL = API_BASE_URL;
