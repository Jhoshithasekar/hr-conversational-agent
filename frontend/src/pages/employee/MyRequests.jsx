import { useEffect, useState } from 'react'

import { useAuth } from '../../context/AuthContext'
import { fetchEmployeeRequests } from '../../api/requestApi'
import RequestCard from '../../components/common/RequestCard'

function MyRequests() {
  const { user } = useAuth()
  const employeeId = user?.employee_id
  const [requests, setRequests] = useState([])
  const [state, setState] = useState({ loading: Boolean(employeeId), error: '' })

  useEffect(() => {
    if (!employeeId) {
      return
    }

    let isCurrent = true

    fetchEmployeeRequests(employeeId)
      .then((requestData) => {
        if (isCurrent) {
          setRequests(requestData)
          setState({ loading: false, error: '' })
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setState({
            loading: false,
            error: error.message || 'Unable to load requests.',
          })
        }
      })

    return () => {
      isCurrent = false
    }
  }, [employeeId])

  return (
    <div className="page-content narrow-content">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Request history</p>
            <h2>Your recent requests</h2>
          </div>
          <span className="section-note">{state.loading ? 'Loading...' : `${requests.length} total`}</span>
        </div>

        {state.loading && <p className="state-message">Loading requests...</p>}
        {!state.loading && state.error && (
          <p className="state-message state-error" role="alert">{state.error}</p>
        )}
        {!state.loading && !state.error && requests.length === 0 && (
          <p className="state-message">No requests found.</p>
        )}
        {!state.loading && !state.error && requests.length > 0 && (
          <div className="request-list request-list-expanded">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default MyRequests
