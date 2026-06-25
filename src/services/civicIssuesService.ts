/**
 * Civic Issues Service
 * Integrates with the real backend API:
 *   GET  /api/issues/{wardNumber}            – list all issues + categories for a ward
 *   POST /api/issues/{wardNumber}            – create a new issue
 *   POST /api/issues/{wardNumber}/hand-raise – raise hand for a category
 *   GET  /api/issues/{wardNumber}/{id}       – get a single issue (if needed)
 */

import { apiClient } from './apiClient';

export interface CivicIssue {
  id: number;
  title: string;
  description: string;
  createdAt: number;   // Unix ms timestamp
  updatedAt: number;
  wardId: number;
  createdById: number;
  isActive: boolean;
}

export interface IssueCategory {
  name: string;
  nameKn?: string;
  count: number;
  isRaised?: boolean;  // Whether the current user has raised their hand for this category
}

export interface IssuesResponse {
  issues: CivicIssue[];
  categories: IssueCategory[];
  totalHandRaises?: number;
}

const toWardParam = (wardNumber: string | number): string => {
  return String(wardNumber).trim();
};

/** Fetch all issues + categories for a ward */
export const getIssuesWithCategories = async (wardNumber: string | number): Promise<IssuesResponse> => {
  const resp = await apiClient.get<IssuesResponse>(`/issues/${toWardParam(wardNumber)}`);
  const data = resp.data ?? {};
  const issues: CivicIssue[] = Array.isArray(data.issues) ? data.issues : [];
  const categories: IssueCategory[] = Array.isArray(data.categories) ? data.categories : [];
  return {
    issues: issues.filter(i => i.isActive !== false).sort((a, b) => b.createdAt - a.createdAt),
    categories,
  };
};

/** Fetch all active issues for a ward (newest first) — backward compat */
export const getIssues = async (wardNumber: string | number): Promise<CivicIssue[]> => {
  const { issues } = await getIssuesWithCategories(wardNumber);
  return issues;
};

/** Raise hand for a category */
export const raiseHandForCategory = async (
  wardNumber: string | number,
  category: string
): Promise<{ raised: boolean }> => {
  const resp = await apiClient.post<{ raised: boolean }>(
    `/issues/${toWardParam(wardNumber)}/hand-raise`,
    { category }
  );
  return resp.data;
};

/** Raise hand for a category in an election/constituency */
export const raiseHandForCategoryByElectionConstituency = async (
  electionId: number,
  constituencyId: number,
  category: string
): Promise<{ raised: boolean }> => {
  const resp = await apiClient.post<{ raised: boolean }>(
    '/issues/hand-raise',
    { category },
    {
      params: {
        electionId,
        constituencyId,
      },
    }
  );
  return resp.data;
};

/** Submit a new civic issue */
export const createIssue = async (
  wardNumber: string | number,
  payload: { title: string; description: string }
): Promise<CivicIssue> => {
  const resp = await apiClient.post<CivicIssue>(`/issues/${toWardParam(wardNumber)}`, {
    title: payload.title.trim(),
    description: payload.description.trim(),
  });
  return resp.data;
};

/** Fetch a single issue by id */
export const getIssue = async (
  wardNumber: string | number,
  id: number
): Promise<CivicIssue> => {
  const resp = await apiClient.get<CivicIssue>(`/issues/${toWardParam(wardNumber)}/${id}`);
  return resp.data;
};

/** Fetch issues filtered by electionId and constituencyId */
export const getIssuesByElectionAndConstituency = async (
  electionId: number,
  constituencyId: number,
  userId?: number
): Promise<IssuesResponse> => {
  const resp = await apiClient.get<IssuesResponse>('/issues', {
    params: {
      electionId,
      constituencyId,
      ...(userId && { userId }),  // Include userId if provided
    },
  });
  const data = resp.data ?? {};
  const issues: CivicIssue[] = Array.isArray(data.issues) ? data.issues : [];
  const categories: IssueCategory[] = Array.isArray(data.categories) ? data.categories : [];
  return {
    issues: issues.filter(i => i.isActive !== false).sort((a, b) => b.createdAt - a.createdAt),
    categories,
    totalHandRaises: typeof (data as any).totalHandRaises === 'number' ? (data as any).totalHandRaises : undefined,
  };
};
