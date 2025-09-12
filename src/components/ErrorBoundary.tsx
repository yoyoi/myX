'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="card text-center">
          <h2 className="text-lg font-semibold mb-2">發生錯誤</h2>
          <p className="text-muted mb-4">請重新整理頁面或稍後再試</p>
          <button 
            className="btn" 
            onClick={() => window.location.reload()}
          >
            重新整理
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
