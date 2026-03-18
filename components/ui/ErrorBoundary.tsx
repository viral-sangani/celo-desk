"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[200px] bg-[#0a0a0a] border border-red-900 p-8">
          <div className="text-center">
            <div className="text-red-400 text-sm font-bold uppercase tracking-wider mb-2">
              SYSTEM ERROR
            </div>
            <div className="text-gray-400 text-xs mb-4">
              {this.state.error?.message ?? "An unexpected error occurred"}
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-1 border border-terminal-green text-terminal-green text-[10px] font-bold uppercase hover:bg-terminal-green/10"
            >
              RETRY
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
