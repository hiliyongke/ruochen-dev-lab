import React from 'react';

type FallbackRender = (error: Error) => React.ReactNode;

type Props = {
  fallback?: React.ReactNode;
  fallbackRender?: FallbackRender;
  children: React.ReactNode;
};

type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // 这里可上报日志
    // console.error('ErrorBoundary caught', error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackRender) return this.props.fallbackRender(this.state.error as Error);
      if (this.props.fallback) return this.props.fallback;
      return <div role="alert">Something went wrong</div>;
    }
    return this.props.children;
  }
}