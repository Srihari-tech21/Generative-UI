'use client';

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error in widget:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 border border-red-200/50 bg-red-50/10 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl shadow-sm">
            <h4 className="font-semibold text-sm">Widget Rendering Failed</h4>
            <p className="text-xs mt-1 text-red-500/80 dark:text-red-400/80">
              {this.state.error?.message || "An unexpected error occurred while rendering this widget."}
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
