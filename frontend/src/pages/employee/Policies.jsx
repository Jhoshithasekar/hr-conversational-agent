import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Eye,
  FileText,
  X,
} from 'lucide-react'

import { fetchPolicies } from '../../api/policyApi'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import FilterBar from '../../components/common/FilterBar'
import LoadingState from '../../components/common/LoadingState'
import StatusBadge from '../../components/common/StatusBadge'

function Policies() {
  const [policies, setPolicies] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [state, setState] = useState({ loading: true, error: '' })
  const [selectedPolicy, setSelectedPolicy] = useState(null)

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

  const categories = useMemo(() => {
    const list = Array.from(new Set(policies.map((p) => p.category).filter(Boolean)))
    return [
      { label: 'All Policies', value: 'all', count: policies.length },
      ...list.map((c) => ({
        label: c,
        value: c,
        count: policies.filter((p) => p.category === c).length,
      })),
    ]
  }, [policies])

  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      if (categoryFilter !== 'all' && policy.category !== categoryFilter) {
        return false
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchName = (policy.name || '').toLowerCase().includes(query)
        const matchCat = (policy.category || '').toLowerCase().includes(query)
        const matchVer = (policy.version || '').toLowerCase().includes(query)
        if (!matchName && !matchCat && !matchVer) return false
      }
      return true
    })
  }, [policies, categoryFilter, searchTerm])

  return (
    <div className="page-content">
      {/* Header */}
      <div className="section-heading" style={{ marginBottom: '18px' }}>
        <div>
          <p className="eyebrow">Documentation</p>
          <h2>Company Policies & Guidelines</h2>
        </div>
        <span className="section-note">
          {state.loading ? 'Loading library...' : `${filteredPolicies.length} of ${policies.length} documents`}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        activeTab={categoryFilter}
        onSearchChange={setSearchTerm}
        onTabChange={setCategoryFilter}
        searchPlaceholder="Search policies by title or category..."
        searchValue={searchTerm}
        tabs={categories}
      />

      {/* State Handlers */}
      {state.loading && <LoadingState message="Loading company policies..." />}
      {!state.loading && state.error && <ErrorState message={state.error} />}

      {!state.loading && !state.error && filteredPolicies.length === 0 && (
        <EmptyState
          description={
            searchTerm || categoryFilter !== 'all'
              ? 'No policies match your search criteria. Try a different query or select All Policies.'
              : 'There are currently no company policy documents published.'
          }
          icon={searchTerm ? 'search' : 'file'}
          title={searchTerm ? 'No Matching Policies' : 'No Policies Published'}
        />
      )}

      {/* Policy Cards Grid */}
      {!state.loading && !state.error && filteredPolicies.length > 0 && (
        <div className="policy-grid">
          {filteredPolicies.map((policy) => (
            <article className="policy-card panel" key={policy.id}>
              <div className="policy-icon">
                <BookOpen aria-hidden="true" size={20} />
              </div>
              <div className="policy-card-body">
                <div className="policy-card-topline">
                  <span style={{ fontWeight: 600, color: '#687789' }}>{policy.category}</span>
                  <StatusBadge status={policy.status} />
                </div>
                <h2>{policy.name}</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <p style={{ margin: 0, color: '#87949d', fontSize: '0.74rem' }}>
                    {policy.version} · Effective {policy.effectiveDate}
                  </p>
                  <button
                    className="secondary-button"
                    onClick={() => setSelectedPolicy(policy)}
                    style={{ height: '32px', minHeight: '32px', padding: '0 12px', fontSize: '0.75rem' }}
                    type="button"
                  >
                    <Eye size={13} style={{ marginRight: '5px' }} />
                    View Policy
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Policy Details Modal Preview */}
      {selectedPolicy && (
        <div className="modal-backdrop" onClick={() => setSelectedPolicy(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              aria-label="Close dialog"
              className="modal-close-btn"
              onClick={() => setSelectedPolicy(null)}
              type="button"
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  background: '#f7e8e1',
                  color: '#a5563f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={22} />
              </div>
              <div>
                <span className="eyebrow" style={{ display: 'block' }}>{selectedPolicy.category}</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Manrope, sans-serif' }}>
                  {selectedPolicy.name}
                </h3>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                background: '#f8faf9',
                border: '1px solid #dfe6e2',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '18px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 700 }}>
                  Version
                </span>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#1d2935' }}>
                  {selectedPolicy.version}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 700 }}>
                  Status
                </span>
                <div style={{ marginTop: '2px' }}>
                  <StatusBadge status={selectedPolicy.status} />
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 700 }}>
                  Effective Date
                </span>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#1d2935' }}>
                  {selectedPolicy.effectiveDate}
                </strong>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #edf1ef', paddingTop: '16px', color: '#52626d', fontSize: '0.86rem', lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 12px' }}>
                This is an official company governance document published under PeopleDesk Enterprise Operations.
                Employees are encouraged to review these provisions and refer questions to their reporting manager or the PeopleDesk HR Assistant.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                className="primary-button"
                onClick={() => setSelectedPolicy(null)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Policies
