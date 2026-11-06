import { apiUrl } from './data';

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  let response;
  try { response = await fetch(apiUrl(path), { credentials: 'include', ...options, headers }); }
  catch { throw new Error('The SkillBridge API is unavailable. Start the backend and try again.'); }
  const body = await response.json().catch(() => ({}));
  if (response.status === 401 && token) window.dispatchEvent(new Event('skillbridge:session-expired'));
  if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`);
  return body;
}

export const apiGet = (path) => api(path);
export const apiPost = (path, value) => api(path, { method: 'POST', body: JSON.stringify(value) });
export const apiPut = (path, value) => api(path, { method: 'PUT', body: JSON.stringify(value) });
export const apiDelete = (path) => api(path, { method: 'DELETE' });
