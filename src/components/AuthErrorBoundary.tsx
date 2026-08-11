'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Wraps Clerk-dependent UI so that a Clerk configuration error (wrong keys,
 * network failure, invalid host, etc.) never propagates to crash the rest of
 * the app. The fallback receives the error so it can show a graceful "auth
 * unavailable" message.
 */
export class AuthErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    console.warn('[AuthErrorBoundary] Clerk auth error caught — degrading gracefully.', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AuthErrorBoundary] Details:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
