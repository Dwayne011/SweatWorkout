/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * A small render-error boundary. Wrap a screen or card so one thrown reference
 * shows a calm fallback instead of taking the whole app to a blank screen.
 * Error boundaries have to be class components — there is no hook equivalent.
 *
 * NOTE: this project ships no @types/react, so React is untyped (`any`) and the
 * inherited React.Component members aren't visible to tsc. We `declare` the few
 * we use (ambient, no runtime emit) so the file typechecks without pulling in
 * the full React type packages.
 */
import React from "react";

interface Props {
  children?: any;
  /** Short name for the wrapped area, used in the console log. */
  label?: string;
  /** Optional custom fallback. Falls back to the default card if omitted. */
  fallback?: any;
}

export class ErrorBoundary extends React.Component {
  declare props: Props;
  declare setState: (state: { hasError: boolean }) => void;
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error(`[ErrorBoundary${this.props.label ? " · " + this.props.label : ""}]`, error, info?.componentStack);
  }

  private handleReset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return <>{this.props.fallback}</>;

    return (
      <div className="pbw-eboundary">
        <div className="ei">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </div>
        <h3>This part hit a snag</h3>
        <p>Something on this screen stopped working. Your workout is safe. Try again, and if it keeps happening, restart the session.</p>
        <button className="ebtn" onClick={this.handleReset}>Try again</button>
      </div>
    );
  }
}

export default ErrorBoundary;
