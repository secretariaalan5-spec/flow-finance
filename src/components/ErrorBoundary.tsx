import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[Porquinho] Erro capturado:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center p-8 text-center"
          style={{ minHeight: '100dvh' }}
        >
          <p className="text-5xl mb-4">🐷💔</p>
          <h2 className="text-lg font-bold text-foreground mb-2">Algo deu errado</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            {this.state.error?.message ?? 'Erro desconhecido.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-3 rounded-2xl gradient-primary text-primary-foreground font-semibold text-sm tap-scale"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
