import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../../src/stores/ui-store';

describe('UI Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useUIStore.setState({
      sidebarOpen: true,
      expandedDomains: new Set<number>(),
      expandedTopics: new Set<number>(),
      activeTopicId: null,
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
});
