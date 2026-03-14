const API_BASE = '/api';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

async function fetchWithTimeout(url: string, options: FetchOptions = {}) {
  const { timeout = 10000, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

export const api = {
  async getSystem() {
    return fetchWithTimeout(`${API_BASE}/system`);
  },
  
  async getKeys() {
    return fetchWithTimeout(`${API_BASE}/keys`);
  },
  
  async getCron() {
    return fetchWithTimeout(`${API_BASE}/cron`);
  },
  
  async runCron(script: string) {
    return fetchWithTimeout(`${API_BASE}/cron/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script }),
    });
  },
  
  async getGithub() {
    return fetchWithTimeout(`${API_BASE}/github`);
  },
  
  async getNetwork() {
    return fetchWithTimeout(`${API_BASE}/network`);
  },
  
  async getServices() {
    return fetchWithTimeout(`${API_BASE}/services`);
  },
  
  async getActivity() {
    return fetchWithTimeout(`${API_BASE}/activity`);
  },
  
  async getProjects() {
    return fetchWithTimeout(`${API_BASE}/projects`);
  },
  
  async getMemories() {
    return fetchWithTimeout(`${API_BASE}/memories`);
  },
  
  async getDocs() {
    return fetchWithTimeout(`${API_BASE}/docs`);
  },
  
  async getExecutives() {
    return fetchWithTimeout(`${API_BASE}/executives`);
  },
  
  async getSubagents() {
    return fetchWithTimeout(`${API_BASE}/subagents`);
  },
  
  async getDocContent(name: string) {
    return fetchWithTimeout(`${API_BASE}/docs/${encodeURIComponent(name)}`);
  },
  
  async getMemoryContent(name: string) {
    return fetchWithTimeout(`${API_BASE}/memories/${encodeURIComponent(name)}`);
  },
};

// Format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format uptime
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
