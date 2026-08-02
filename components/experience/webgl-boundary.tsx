"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class WebGLBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("Cinematic canvas failed; using the semantic fallback.", error, info);
    }
  }

  render() {
    if (this.state.failed) {
      return <div className="experience-fallback" data-testid="webgl-fallback" />;
    }
    return this.props.children;
  }
}
