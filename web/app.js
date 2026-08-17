const state = { user: null };
async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.status === 204 ? null : response.json();
}
window.NusaSec = { api, state };

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-action="logout"]').forEach(el => el.addEventListener('click', async () => {
    try { await api('/auth/logout', { method: 'POST' }); } finally { location.href = '/login/'; }
  }));
});
