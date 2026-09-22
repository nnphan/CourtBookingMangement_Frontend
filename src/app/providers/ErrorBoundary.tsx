import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ALO Booking] render error', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="auth-canvas grid min-h-dvh place-items-center px-4 text-center text-content-onbrand">
        <div>
          <p className="text-xl font-bold">Ứng dụng gặp sự cố</p>
          <p className="mt-2 opacity-90">Tải lại trang để tiếp tục.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 h-12 rounded-[var(--radius-field)] bg-surface px-6 font-semibold text-brand-600"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }
}
