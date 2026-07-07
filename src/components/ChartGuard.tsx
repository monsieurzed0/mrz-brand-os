import React from 'react';

type Props = {
  title?: string;
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message?: string;
};

export default class ChartGuard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || 'Erreur inconnue',
    };
  }

  componentDidCatch(error: Error) {
    console.error('ChartGuard caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-900/20 bg-red-950/10 p-4">
          <p className="text-xs uppercase tracking-wider text-red-400 font-bold">
            {this.props.title || 'Module graphique'}
          </p>
          <p className="mt-2 text-sm text-red-300">
            Ce composant a rencontré une erreur et a été isolé.
          </p>
          {this.state.message ? (
            <p className="mt-2 text-xs text-red-200/80">{this.state.message}</p>
          ) : null}
        </div>
      );
    }

    return this.props.children;
  }
}
