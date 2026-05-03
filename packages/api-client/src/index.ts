import type {
  AdminSummary,
  GreenFlag,
  GreenFlagReason,
  Match,
  Report,
  ReviewCandidate,
  Sanction,
  User
} from '@green/domain';
import { DEFAULT_API_BASE_URL } from '@green/config';

export interface GreenApiClientOptions {
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export interface CreateGreenFlagInput {
  fromUserId: string;
  toUserId: string;
  reasons: GreenFlagReason[];
}

async function request<T>(
  path: string,
  options: RequestInit,
  baseUrl: string,
  fetcher: typeof fetch
): Promise<T> {
  const response = await fetcher(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Green API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function createGreenApiClient(options: GreenApiClientOptions = {}) {
  const baseUrl = options.baseUrl || DEFAULT_API_BASE_URL;
  const fetcher = options.fetcher || fetch;

  return {
    health: () => request<{ ok: boolean; service: string }>('/health', {}, baseUrl, fetcher),
    reviewPool: () => request<ReviewCandidate[]>('/review-pool', {}, baseUrl, fetcher),
    createGreenFlag: (input: CreateGreenFlagInput) =>
      request<GreenFlag>(
        '/green-flags',
        { method: 'POST', body: JSON.stringify(input) },
        baseUrl,
        fetcher
      ),
    matches: () => request<Match[]>('/matches', {}, baseUrl, fetcher),
    users: () => request<User[]>('/admin/users', {}, baseUrl, fetcher),
    reports: () => request<Report[]>('/admin/reports', {}, baseUrl, fetcher),
    sanctions: () => request<Sanction[]>('/admin/sanctions', {}, baseUrl, fetcher),
    adminSummary: () => request<AdminSummary>('/admin/summary', {}, baseUrl, fetcher)
  };
}

export type GreenApiClient = ReturnType<typeof createGreenApiClient>;
