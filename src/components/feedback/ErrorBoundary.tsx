import { Component, type ErrorInfo, type ReactNode } from "react";
import { Panel } from "@/components/panels/Panel";
import { Button } from "@/components/ui/Button";

interface ErrorBoundaryState {
  error?: Error;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Fashion Studio render failed", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-6">
          <Panel>
            <h1 className="text-2xl font-semibold">The studio hit a render error.</h1>
            <p className="mt-2 text-sm text-ink/60">
              The app recovered instead of leaving a blank screen. Refresh the workspace and try again.
            </p>
            <p className="mt-4 rounded-md bg-ink/5 p-3 text-sm text-red-700">
              {this.state.error.message}
            </p>
            <Button className="mt-5" onClick={() => window.location.assign("/designs/new")} type="button">
              Back to SKU Gen
            </Button>
          </Panel>
        </div>
      );
    }

    return this.props.children;
  }
}
