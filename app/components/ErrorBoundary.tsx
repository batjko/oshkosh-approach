import { Component, ReactNode } from 'react'
import { MdError, MdRefresh } from 'react-icons/md'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="card bg-base-100 shadow-xl max-w-md w-full">
            <div className="card-body text-center">
              <MdError className="h-16 w-16 text-error mx-auto mb-4" />
              <h2 className="card-title text-2xl text-error justify-center">
                Something went wrong
              </h2>
              <p className="text-base-content/70 mt-2">
                We're sorry, but an unexpected error occurred. Please try refreshing the page.
              </p>
              {this.state.error && (
                <details className="collapse collapse-arrow bg-base-200 mt-4">
                  <summary className="collapse-title text-sm font-medium">
                    Error details
                  </summary>
                  <div className="collapse-content">
                    <pre className="text-xs text-left overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                </details>
              )}
              <div className="card-actions justify-center mt-6">
                <button 
                  onClick={this.handleReset}
                  className="btn btn-primary"
                >
                  <MdRefresh className="mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}