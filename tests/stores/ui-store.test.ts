import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../../src/stores/ui-store';

describe('UI Store', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store to initial state
    useUIStore.setState({
      sidebarOpen: true,
      expandedDomains: new Set<number>(),
      expandedTopics: new Set<number>(),
      activeTopicId: null,
      themeMode: 'system',
      progressMode: 'flat',
    });
  });

  it('initializes with sidebar open', () => {
    const state = useUIStore.getState();
    expect(state.sidebarOpen).toBe(true);
  });

  it('toggles sidebar', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('sets sidebar open explicitly', () => {
    useUIStore.getState().setSidebarOpen(false);
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    useUIStore.getState().setSidebarOpen(true);
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('toggles domain expansion', () => {
    useUIStore.getState().toggleDomain(1);
    expect(useUIStore.getState().expandedDomains.has(1)).toBe(true);

    useUIStore.getState().toggleDomain(1);
    expect(useUIStore.getState().expandedDomains.has(1)).toBe(false);
  });

  it('expands domain', () => {
    useUIStore.getState().expandDomain(2);
    expect(useUIStore.getState().expandedDomains.has(2)).toBe(true);
  });

  it('toggles topic expansion', () => {
    useUIStore.getState().toggleTopic(5);
    expect(useUIStore.getState().expandedTopics.has(5)).toBe(true);

    useUIStore.getState().toggleTopic(5);
    expect(useUIStore.getState().expandedTopics.has(5)).toBe(false);
  });

  it('expands topic', () => {
    useUIStore.getState().expandTopic(10);
    expect(useUIStore.getState().expandedTopics.has(10)).toBe(true);
  });

  it('sets active topic id', () => {
    useUIStore.getState().setActiveTopicId(42);
    expect(useUIStore.getState().activeTopicId).toBe(42);

    useUIStore.getState().setActiveTopicId(null);
    expect(useUIStore.getState().activeTopicId).toBeNull();
  });

  describe('theme', () => {
    it('initializes with system theme', () => {
      expect(useUIStore.getState().themeMode).toBe('system');
    });

    it('setTheme updates the theme mode', () => {
      useUIStore.getState().setTheme('dark');
      expect(useUIStore.getState().themeMode).toBe('dark');

      useUIStore.getState().setTheme('light');
      expect(useUIStore.getState().themeMode).toBe('light');

      useUIStore.getState().setTheme('system');
      expect(useUIStore.getState().themeMode).toBe('system');
    });

    it('persists theme mode to localStorage', () => {
      useUIStore.getState().setTheme('dark');
      const stored = JSON.parse(localStorage.getItem('theme-storage')!);
      expect(stored.state.themeMode).toBe('dark');
    });

    it('does not persist non-theme state', () => {
      useUIStore.getState().setTheme('dark');
      useUIStore.getState().toggleSidebar();
      const stored = JSON.parse(localStorage.getItem('theme-storage')!);
      // sidebarOpen should not be in the persisted state
      expect(stored.state.sidebarOpen).toBeUndefined();
      expect(stored.state.themeMode).toBe('dark');
    });
  });

  describe('progressMode', () => {
    it('initializes with flat mode', () => {
      expect(useUIStore.getState().progressMode).toBe('flat');
    });

    it('setProgressMode updates the mode', () => {
      useUIStore.getState().setProgressMode('weighted');
      expect(useUIStore.getState().progressMode).toBe('weighted');

      useUIStore.getState().setProgressMode('flat');
      expect(useUIStore.getState().progressMode).toBe('flat');
    });

    it('persists progressMode to localStorage', () => {
      useUIStore.getState().setProgressMode('weighted');
      const stored = JSON.parse(localStorage.getItem('theme-storage')!);
      expect(stored.state.progressMode).toBe('weighted');
    });

    it('does not persist non-ui state alongside progressMode', () => {
      useUIStore.getState().setProgressMode('weighted');
      useUIStore.getState().toggleSidebar();
      const stored = JSON.parse(localStorage.getItem('theme-storage')!);
      expect(stored.state.progressMode).toBe('weighted');
      expect(stored.state.sidebarOpen).toBeUndefined();
    });
  });
});
