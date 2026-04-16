// API URL - uses relative path for same-domain deployment on Vercel
const API_URL = '/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  
  let data: unknown;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = 
      typeof data === 'object' && data !== null && 'message' in data
        ? String(data.message)
        : `HTTP ${response.status}: ${response.statusText}`;
    
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

// API client with typed methods
export const api = {
  get: <T>(endpoint: string, headers?: Record<string, string>) =>
    fetchWithAuth<T>(endpoint, { method: 'GET', headers }),

  post: <T>(endpoint: string, body: unknown, headers?: Record<string, string>) =>
    fetchWithAuth<T>(endpoint, { method: 'POST', body, headers }),

  put: <T>(endpoint: string, body: unknown, headers?: Record<string, string>) =>
    fetchWithAuth<T>(endpoint, { method: 'PUT', body, headers }),

  patch: <T>(endpoint: string, body: unknown, headers?: Record<string, string>) =>
    fetchWithAuth<T>(endpoint, { method: 'PATCH', body, headers }),

  delete: <T>(endpoint: string, headers?: Record<string, string>) =>
    fetchWithAuth<T>(endpoint, { method: 'DELETE', headers }),
};

// Typed API endpoints for the symptothermie app
export interface CycleEntry {
  id?: string;
  date: string;
  temperature: number;
  mucusType?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg-white';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CycleSummary {
  currentCycleDay: number;
  estimatedOvulation?: string;
  nextPeriod?: string;
  fertilityStatus: 'fertile' | 'infertile' | 'uncertain';
}

export const entriesApi = {
  getAll: () => api.get<CycleEntry[]>('/entries'),
  getByDate: (date: string) => api.get<CycleEntry>(`/entries/${date}`),
  create: (entry: Omit<CycleEntry, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<CycleEntry>('/entries', entry),
  update: (date: string, entry: Partial<CycleEntry>) =>
    api.patch<CycleEntry>(`/entries/${date}`, entry),
  delete: (date: string) => api.delete<void>(`/entries/${date}`),
  getChartData: (days: number = 30) =>
    api.get<CycleEntry[]>(`/entries/chart?days=${days}`),
};

export const cycleApi = {
  getSummary: () => api.get<CycleSummary>('/cycle/summary'),
  getCalendar: (month: number, year: number) =>
    api.get<CycleEntry[]>(`/cycle/calendar?month=${month}&year=${year}`),
};

export { ApiError };
