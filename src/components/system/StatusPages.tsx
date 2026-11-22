import React from 'react';
import { AlertTriangle, ArrowLeft, Clock3, Home, Wrench } from 'lucide-react';

type StatusPageType = 'not-found' | 'server-error' | 'maintenance';

const statusContent: Record<
  StatusPageType,
  { code: string; title: string; message: string; icon: typeof AlertTriangle }
> = {
  'not-found': {
    code: '404',
    title: 'Page not found',
    message: 'The page you requested does not exist or may have moved.',
    icon: AlertTriangle,
  },
  'server-error': {
    code: '500',
    title: 'Something went wrong',
    message: 'We could not complete that request. Please try again in a moment.',
    icon: Wrench,
  },
  maintenance: {
    code: 'MAINTENANCE',
    title: 'We’ll be back soon',
    message: 'Estate Analytics is temporarily unavailable while we carry out maintenance.',
    icon: Clock3,
  },
};

interface StatusPageProps {
  type: StatusPageType;
  onRetry?: () => void;
  message?: string;
}

export const StatusPage: React.FC<StatusPageProps> = ({ type, onRetry, message }) => {
  const content = statusContent[type];
  const Icon = content.icon;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F3EDE3] px-6 py-12 text-center">
      <div className="w-full max-w-lg rounded-2xl border border-[#DED6C9] bg-[#FAF8F3] p-8 shadow-sm sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#641F2B]/10 text-[#641F2B]">
          <Icon aria-hidden="true" className="h-7 w-7" />
        </div>
        <p className="mt-6 font-mono text-sm font-semibold tracking-[0.2em] text-[#641F2B]">
          {content.code}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-extrabold text-[#252525]">
          {content.title}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#747474]">
          {message ?? content.message}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-[#641F2B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#48151F]"
            >
              Try again
            </button>
          )}
          {type !== 'maintenance' && (
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-[#DED6C9] px-4 py-2.5 text-sm font-semibold text-[#252525] hover:bg-white"
            >
              {type === 'not-found' ? <Home className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              Go to dashboard
            </a>
          )}
        </div>
      </div>
    </main>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application render failed:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <StatusPage type="server-error" onRetry={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}
