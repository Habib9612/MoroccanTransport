import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { queryClient } from '../../client/src/lib/queryClient';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import App from '../../client/src/App';
import { QueryClientProvider } from '@tanstack/react-query';

// Mock the useUser hook at the top level
vi.mock('@/hooks/use-user', () => ({
  useUser: vi.fn(() => ({
    user: null,
    isLoading: false
  }))
}));

describe('App Configuration', () => {
  beforeEach(() => {
    cleanup();
    // Reset useUser mock before each test
    vi.mocked(vi.importMock('@/hooks/use-user').useUser).mockImplementation(() => ({
      user: null,
      isLoading: false
    }));
  });

  it('should have queryClient configured', () => {
    expect(queryClient).toBeDefined();
  });

  it('should render the app without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    expect(document.querySelector('#root')).toBeTruthy();
  });

  it('should show loading state initially', async () => {
    // Override the mock for this specific test
    vi.mocked(vi.importMock('@/hooks/use-user').useUser).mockImplementation(() => ({
      user: null,
      isLoading: true
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

describe('Landing Page', () => {
  beforeEach(() => {
    cleanup();
    // Reset useUser mock before each test
    vi.mocked(vi.importMock('@/hooks/use-user').useUser).mockImplementation(() => ({
      user: null,
      isLoading: false
    }));
  });

  it('should show landing page for non-authenticated users', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headingElement = screen.getByRole('heading', {
        level: 1,
        name: /Revolutionizing Freight Logistics in Morocco/i
      });
      expect(headingElement).toBeInTheDocument();
    });
  });
});