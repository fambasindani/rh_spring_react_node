import React from 'react';

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Error boundary globale : évite l'écran blanc quand une erreur de rendu survient
 * et affiche le détail de l'erreur pour faciliter le diagnostic.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary a capturé une erreur :', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    this.setState({ error: null, errorInfo: null });
  };

  render(): React.ReactNode {
    const { error, errorInfo } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl shadow-lg p-6">
          <h1 className="text-lg font-bold text-rose-700 dark:text-rose-400">Une erreur est survenue</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            L'application a rencontré une erreur inattendue. Vous pouvez réessayer ou recharger la page.
          </p>

          <pre className="mt-4 max-h-64 overflow-auto text-xs bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-300 p-3 rounded-lg whitespace-pre-wrap">
            {error.message}
            {errorInfo?.componentStack ? `\n${errorInfo.componentStack}` : ''}
          </pre>

          <div className="mt-4 flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Réessayer
            </button>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              Recharger la page
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
