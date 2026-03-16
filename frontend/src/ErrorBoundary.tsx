/**
 * React error boundary — catches render-time exceptions.
 *
 * Why a class component: React's error boundary API (getDerivedStateFromError,
 * componentDidCatch) is only available in class components. There is no
 * hooks equivalent as of React 19.
 *
 * Why this exists: Without it, a single component crash would unmount
 * the entire app with a blank screen. This shows a user-friendly
 * fallback and logs the error for debugging.
 */

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught in ErrorBoundary:", error);
    console.error("Error info:", errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 items-center bg-red-100 border border-red-300 rounded">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm">{this.state.errorMessage}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
