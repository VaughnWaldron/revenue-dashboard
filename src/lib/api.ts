import type { ReportRecord } from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error || `Request failed (${res.status})`, res.status);
  }
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// --- Auth ---------------------------------------------------------------

export function login(password: string) {
  return request<{ ok: true }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export function logout() {
  return request<{ ok: true }>('/api/auth/logout', { method: 'POST' });
}

export function checkAuth() {
  return request<{ authenticated: boolean }>('/api/auth/check');
}

// --- Public report --------------------------------------------------------

export function fetchPublicReport(slug: string) {
  return request<ReportRecord>(`/api/report/${encodeURIComponent(slug)}`);
}

// --- Admin reports ---------------------------------------------------------

export function listReports() {
  return request<ReportRecord[]>('/api/admin/reports');
}

export function getReport(id: string) {
  return request<ReportRecord>(`/api/admin/reports/${encodeURIComponent(id)}`);
}

export function createReport(data: Omit<ReportRecord, 'id' | 'createdAt' | 'updatedAt'>) {
  return request<ReportRecord>('/api/admin/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateReport(id: string, data: Partial<ReportRecord>) {
  return request<ReportRecord>(`/api/admin/reports/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteReport(id: string) {
  return request<{ ok: true }>(`/api/admin/reports/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function uploadLogo(dataUrl: string, filename: string) {
  return request<{ url: string }>('/api/admin/upload-logo', {
    method: 'POST',
    body: JSON.stringify({ dataUrl, filename }),
  });
}
