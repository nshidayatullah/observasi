import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink-50 p-6 text-center">
          <h1 className="font-display text-display text-ink-900">Terjadi Kesalahan</h1>
          <p className="text-ink-500">Aplikasi mengalami kesalahan yang tidak terduga.</p>
          <Button
            variant="secondary"
            onClick={() => {
              this.setState({ error: null });
              window.location.href = '/beranda';
            }}
          >
            Kembali ke Beranda
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
