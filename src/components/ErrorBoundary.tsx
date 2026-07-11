import React from "react";

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("Application error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/90">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="font-[Orbitron] text-2xl text-red-400 mb-2">
              System Error
            </h1>
            <p className="text-slate-400 mb-4">
              An unexpected error has occurred.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="font-[JetBrains_Mono] text-sm text-white border border-white/20 px-4 py-2 rounded-md bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
            >
              Reload System
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}