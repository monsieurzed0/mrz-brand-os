const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'API error');
  }

  return response.json();
}

export const api = {
  getDashboardSummary: () => apiFetch('/api/dashboard/summary'),
  getBrandMemory: () => apiFetch('/api/brand-memory'),
  getMediaLinks: () => apiFetch('/api/media-links'),
  getNotifications: () => apiFetch('/api/notifications'),
  search: (q: string) => apiFetch(`/api/search?q=${encodeURIComponent(q)}`),
};
