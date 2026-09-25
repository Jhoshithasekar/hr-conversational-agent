import { AlertCircle, RefreshCw } from 'lucide-react'

function ErrorState({ message = 'An unexpected error occurred.', onRetry, retryLabel = 'Try again' }) {
  return (
    <div className="error-state-panel" role="alert">
      <AlertCircle className="error-state-icon" size={20} />
      <div className="error-state-copy">
        <p className="error-state-message">{message}</p>
      </div>
      {onRetry && (
        <button className="secondary-button error-retry-btn" onClick={onRetry} type="button">
          <RefreshCw size={13} style={{ marginRight: '6px' }} />
          {retryLabel}
        </button>
      )}
    </div>
  )
}

export default ErrorState
