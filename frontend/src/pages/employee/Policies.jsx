import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Search } from 'lucide-react'

import { fetchPolicies } from '../../api/policyApi'
import StatusBadge from '../../components/common/StatusBadge'

function Policies() {
  const [policies, setPolicies] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [state, setState] = useState({ loading: true, error: '' })

  useEffect(() => {
    let isCurrent = true

    fetchPolicies()
      .then((policyData) => {
        if (isCurrent) {
          setPolicies(policyData)
          setState({ loading: false, error: '' })
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setState({
            loading: false,
            error: error.message || 'Unable to load policies.',
          })
        }
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const filteredPolicies = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return policies

    return policies.filter((policy) => (
      policy.name.toLowerCase().includes(query)
      || policy.category.toLowerCase().includes(query)
    ))
  }, [policies, searchTerm])

  return (
    <div className="page-content">
      <div className="policy-toolbar">
        <label className="search-field">
          <Search aria-hidden="true" size={17} />
          <span className="sr-only">Search policies</span>
          <input
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search policies"
            type="search"
            value={searchTerm}
          />
        </label>
      </div>

      {state.loading && <p className="state-message">Loading policies...</p>}
      {!state.loading && state.error && (
        <p className="state-message state-error" role="alert">{state.error}</p>
      )}
      {!state.loading && !state.error && filteredPolicies.length === 0 && (
        <p className="state-message">No policies found.</p>
      )}
      {!state.loading && !state.error && filteredPolicies.length > 0 && (
        <div className="policy-grid">
          {filteredPolicies.map((policy) => (
            <article className="policy-card panel" key={policy.id}>
              <div className="policy-icon"><BookOpen aria-hidden="true" size={20} /></div>
              <div className="policy-card-body">
                <div className="policy-card-topline">
                  <span>{policy.category}</span>
                  <StatusBadge status={policy.status} />
                </div>
                <h2>{policy.name}</h2>
                <p>{policy.version} · Effective {policy.effectiveDate}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default Policies
