import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { queryClient } from '../../client/src/lib/queryClient';
import { render, screen, cleanup } from '@testing-library/react';
import App from '../../client/src/App';
import { QueryClientProvider } from '@tanstack/react-query';

describe('App Configuration', () => {
  beforeEach(() => {
    cleanup();
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

  it('should show loading state initially', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    const loadingElement = screen.getByRole('progressbar');
    expect(loadingElement).toBeInTheDocument();
  });
});

describe('Landing Page', () => {
  beforeEach(() => {
    cleanup();
  });

  it('should show landing page for non-authenticated users', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    expect(screen.getByText(/Revolutionizing Freight Logistics/i)).toBeInTheDocument();
  });
});