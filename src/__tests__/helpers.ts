// Test helpers and utilities
import { vi } from 'vitest';

/**
 * Creates a mock HTML element for testing
 */
export function createMockElement(tag: string = 'div'): HTMLElement {
  const element = document.createElement(tag);
  return element;
}

/**
 * Wait for async operations to complete
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a mock File object for testing file uploads
 */
export function createMockFile(
  name: string,
  content: string,
  type: string = 'application/json'
): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

/**
 * Helper to flush all pending promises
 */
export async function flushPromises(): Promise<void> {
  return new Promise(resolve => setImmediate(resolve));
}

/**
 * Mock timer utilities
 */
export const mockTimers = {
  setup: () => {
    vi.useFakeTimers();
  },
  teardown: () => {
    vi.useRealTimers();
  },
  advance: (ms: number) => {
    vi.advanceTimersByTime(ms);
  },
};
