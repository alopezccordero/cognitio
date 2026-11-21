import { Component, type ReactNode } from 'react'

/** Keeps a page alive when WebGL is unavailable: shows `fallback` instead of the 3D scene. */
export class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
