import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { expect, vi } from 'vitest';

// runs a cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock matchMedia if not available
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Add root element for React rendering
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
}