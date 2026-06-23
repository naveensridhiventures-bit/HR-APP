import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Pipeline error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-sm text-slate">Something went wrong loading this pipeline.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
