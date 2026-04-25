import React from 'react';
import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7979/api';

export type IssueCategory = 'Infrastructure' | 'Sanitation' | 'Safety' | 'Greenery';
export type IssueStatus = 'New' | 'In Progress' | 'Resolved';

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  votes: number;
  // Legacy
  location: string;
  // Multi-level
  state?: string;
  city?: string;
  town?: string;
  pinX?: number;
  pinY?: number;
  // Geographic coordinates for Leaflet
  latlng?: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
}

interface IssueStore {
  issues: Issue[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  fetchIssues: () => Promise<void>;
  addIssue: (issueData: Partial<Issue>) => Promise<void>;
  updateStatus: (id: string, status: IssueStatus) => Promise<void>;
  upvoteIssue: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
}

export const useIssueStore = create<IssueStore>((set, get) => ({
  issues: [],
  searchQuery: '',
  isLoading: false,
  error: null,

  fetchIssues: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/issues`, { withCredentials: true });
      set({ issues: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addIssue: async (issueData) => {
    try {
      const response = await axios.post(`${API_URL}/issues`, issueData, { withCredentials: true });
      set({ issues: [response.data, ...get().issues] });
    } catch (error: any) {
      console.error('Error adding issue:', error);
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    const previousIssues = get().issues;
    set({ issues: previousIssues.map((i) => i._id === id ? { ...i, status } : i) });
    try {
      await axios.patch(`${API_URL}/issues/${id}`, { status }, { withCredentials: true });
    } catch {
      set({ issues: previousIssues });
    }
  },

  upvoteIssue: async (id) => {
    const previousIssues = get().issues;
    set({ issues: previousIssues.map((i) => i._id === id ? { ...i, votes: i.votes + 1 } : i) });
    try {
      await axios.post(`${API_URL}/issues/${id}/upvote`, {}, { withCredentials: true });
    } catch {
      set({ issues: previousIssues });
    }
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

export const useFilteredIssues = () => {
  const { issues, searchQuery } = useIssueStore();
  return React.useMemo(() => {
    if (!searchQuery) return issues;
    const query = searchQuery.toLowerCase();
    return issues.filter((i) => 
      i.title?.toLowerCase().includes(query) ||
      i.city?.toLowerCase().includes(query) ||
      i.state?.toLowerCase().includes(query) ||
      i.town?.toLowerCase().includes(query) ||
      i.category?.toLowerCase().includes(query)
    );
  }, [issues, searchQuery]);
};
