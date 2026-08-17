const I18N = {
  en: { dashboard: 'Dashboard', products: 'Products', billing: 'Billing', logout: 'Log out' },
  id: { dashboard: 'Dasbor', products: 'Produk', billing: 'Penagihan', logout: 'Keluar' }
};
export function t(key, locale = document.documentElement.lang || 'id') { return I18N[locale]?.[key] ?? I18N.id[key] ?? key; }
export function apiFetch(url, options = {}) { return fetch(url, { ...options, credentials: 'include' }); }
