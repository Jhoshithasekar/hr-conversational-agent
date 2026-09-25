import { Component } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Frontend ErrorBoundary caught an exception:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    } else {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="page-content" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div className="panel" style={{ maxWidth: '540px', margin: '0 auto', padding: '32px' }}>
            <AlertCircle size={44} style={{ color: '#c0392b', marginBottom: '16px' }} />
            <h2 style={{ marginBottom: '8px' }}>Something went wrong</h2>
            <p style={{ color: '#687789', fontSize: '0.88rem', marginBottom: '20px' }}>
              An unexpected error occurred while loading this view. The application has isolated the error to keep your session secure.
            </p>
            {this.state.error?.message && (
              <div
                style={{
                  background: '#fdf2f2',
                  border: '1px solid #f8b4b4',
                  borderRadius: '6px',
                  color: '#991b1b',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  margin: '0 0 16px',
                  padding: '10px 14px',
                  textAlign: 'left',
                  wordBreak: 'break-word',
                }}
              >
                <strong>Error:</strong> {this.state.error.message}
              </div>
            )}
            <button
              className="primary-button"
              onClick={this.handleReset}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              type="button"
            >
              <RefreshCw size={15} /> Reload Workspace
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
