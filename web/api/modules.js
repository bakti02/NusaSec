/* NusaSec Control Tower module API adapters.
 * Presentation layer only. Existing /api proxy and authentication are preserved.
 * Endpoint paths are isolated here so the Core contract can be mapped without
 * touching the UI when the production Core is connected.
 */
const MODULES = {
  attack: { label: 'Attack Surface', endpoint: '/attack-surface' },
  threat: { label: 'Threat Intelligence', endpoint: '/threat-intelligence' },
  vuln: { label: 'Vulnerabilities', endpoint: '/vulnerabilities' },
  monitor: { label: 'Monitoring', endpoint: '/monitoring' },
  incidents: { label: 'Incidents', endpoint: '/incidents' },
  compliance: { label: 'Compliance', endpoint: '/compliance' }
};

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, { credentials: 'include', ...options });
  const type = response.headers.get('content-type') || '';
  const body = type.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) throw Object.assign(new Error(body?.detail || body?.message || `API ${response.status}`), { status: response.status, body });
  return body;
}

export async function loadModule(key, params = '') {
  const module = MODULES[key];
  if (!module) throw new Error(`Unknown module: ${key}`);
  return request(`${module.endpoint}${params}`);
}

export async function loadModuleResource(key, resource, params = '') {
  const module = MODULES[key];
  if (!module) throw new Error(`Unknown module: ${key}`);
  return request(`${module.endpoint}/${resource}${params}`);
}

export async function runAssessment() {
  return request('/assessments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'control-tower' }) });
}

export { MODULES };
