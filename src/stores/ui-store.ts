import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ProgressMode = 'flat' | 'weighted';

interface UIState {
  sidebarOpen: boolean;
  expandedDomains: Set<number>;
  expandedTopics: Set<number>;
  activeTopicId: number | null;
  themeMode: ThemeMode;
  progressMode: ProgressMode;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDomain: (domainId: number) => void;
  expandDomain: (domainId: number) => void;
  toggleTopic: (topicId: number) => void;
  expandTopic: (topicId: number) => void;
  setActiveTopicId: (topicId: number | null) => void;
  setTheme: (mode: ThemeMode) => void;
  setProgressMode: (mode: ProgressMode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      expandedDomains: new Set<number>(),
      expandedTopics: new Set<number>(),
      activeTopicId: null,
      themeMode: 'system',
      progressMode: 'flat',

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleDomain: (domainId) =>
        set((s) => {
          const next = new Set(s.expandedDomains);
          if (next.has(domainId)) {
            next.delete(domainId);
          } else {
            next.add(domainId);
          }
          return { expandedDomains: next };
        }),

      expandDomain: (domainId) =>
        set((s) => {
          const next = new Set(s.expandedDomains);
          next.add(domainId);
          return { expandedDomains: next };
        }),

      toggleTopic: (topicId) =>
        set((s) => {
          const next = new Set(s.expandedTopics);
          if (next.has(topicId)) {
            next.delete(topicId);
          } else {
            next.add(topicId);
          }
          return { expandedTopics: next };
        }),

      expandTopic: (topicId) =>
        set((s) => {
          const next = new Set(s.expandedTopics);
          next.add(topicId);
          return { expandedTopics: next };
        }),

      setActiveTopicId: (topicId) => set({ activeTopicId: topicId }),
      setTheme: (mode) => set({ themeMode: mode }),
      setProgressMode: (mode) => set({ progressMode: mode }),
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        themeMode: state.themeMode,
        progressMode: state.progressMode,
      }),
    },
  ),
);
