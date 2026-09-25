import { Loader2 } from 'lucide-react'

function LoadingState({ message = 'Loading workspace data...' }) {
  return (
    <div className="loading-state-container" role="status">
      <Loader2 className="loading-spinner" size={24} />
      <span className="loading-state-message">{message}</span>
    </div>
  )
}

export default LoadingState
