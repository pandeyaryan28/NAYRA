import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {this.props.fallbackTitle || 'Something went wrong rendering this section'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mb-4">
            An unexpected error occurred. You can retry rendering or return to the main dashboard.
          </p>
          {this.state.error?.message && (
            <div className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 p-2.5 rounded-lg max-w-lg mb-4 text-left overflow-x-auto">
              {this.state.error.message}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="gap-1.5 rounded-lg text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                window.location.href = '/';
              }}
              className="gap-1.5 rounded-lg text-xs bg-[#007AFF] text-white hover:bg-[#0062cc]"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
