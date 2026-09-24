import { useEffect, useState } from 'react'

import { EMPLOYEE_ID } from '../../api/employeeApi'
import { fetchEmployeeRequests } from '../../api/requestApi'
import RequestCard from '../../components/common/RequestCard'

function MyRequests() {
  const [requests, setRequests] = useState([])
  const [state, setState] = useState({ loading: true, error: '' })

  useEffect(() => {
    let isCurrent = true

    fetchEmployeeRequests(EMPLOYEE_ID)
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
  }, [])

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
