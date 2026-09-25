import { useState } from 'react'
import {
  Clock,
  Eye,
  Lock,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import StatusBadge from '../../components/common/StatusBadge'
import FilterBar from '../../components/common/FilterBar'
import EmptyState from '../../components/common/EmptyState'
import { initialIccCases } from '../../data/iccMockData'

function ICCCases() {
  const [cases] = useState(initialIccCases)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const distinctTypes = Array.from(new Set(cases.map((c) => c.caseType)))

  const statusTabs = [
    { label: 'All Cases', value: 'all', count: cases.length },
    { label: 'Under Inquiry', value: 'Under Inquiry' },
    { label: 'Hearing Scheduled', value: 'Hearing Scheduled' },
    { label: 'Report Pending', value: 'Report Pending' },
    { label: 'Closed', value: 'Closed' },
  ]

  const typeOptions = [
    { label: 'All Case Types', value: 'all' },
    ...distinctTypes.map((t) => ({ label: t, value: t })),
  ]

  const filteredCases = cases.filter((c) => {
    if (statusFilter !== 'all' && c.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false
    }
    if (typeFilter !== 'all' && c.caseType.toLowerCase() !== typeFilter.toLowerCase()) {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchId = c.id.toLowerCase().includes(q)
      const matchType = c.caseType.toLowerCase().includes(q)
      const matchOfficer = c.assignedOfficer.toLowerCase().includes(q)
      const matchDept = c.department.toLowerCase().includes(q)
      if (!matchId && !matchType && !matchOfficer && !matchDept) return false
    }
    return true
  })

  return (
    <div className="page-content">
      {/* Privacy Notice Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <Lock size={16} style={{ color: '#475569', flexShrink: 0 }} />
        <div style={{ fontSize: '0.82rem', color: '#334155' }}>
          <strong>Complainant Privacy Safeguard:</strong> Direct personal identities are protected in the case list.
          Full witness statements and unredacted filings are restricted strictly to formal hearing sessions.
        </div>
      </div>

      <div className="section-heading" style={{ marginBottom: '20px' }}>
        <div>
          <p className="eyebrow">Case Management</p>
          <h2>Inquiry Proceedings Registry</h2>
        </div>
        <span className="section-note">
          {filteredCases.length} confidential proceeding{filteredCases.length !== 1 ? 's' : ''} listed
        </span>
      </div>

      {/* Filter and Search Bar using FilterBar */}
      <FilterBar
        activeTab={statusFilter}
        onSearchChange={setSearchQuery}
        onSelectChange={setTypeFilter}
        onTabChange={setStatusFilter}
        searchPlaceholder="Search case ID, type, officer, or department..."
        searchValue={searchQuery}
        selectLabel="Filter by case type"
        selectOptions={typeOptions}
        selectValue={typeFilter}
        tabs={statusTabs}
      />

      {/* Cases Table */}
      {filteredCases.length === 0 ? (
        <EmptyState
          description="No inquiry records match the selected status or search query."
          icon="search"
          title="No inquiry records found"
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Case ID</th>
                <th>Case Type</th>
                <th style={{ width: '120px' }}>Submitted Date</th>
                <th style={{ width: '150px' }}>Status</th>
                <th>Assigned Officer</th>
                <th style={{ width: '180px' }}>Target / Deadline</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((item) => {
                const isClosed = item.status === 'Closed'
                const isUrgent = !isClosed && item.daysRemaining <= 10

                return (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ fontSize: '0.86rem', color: '#1d2935' }}>{item.id}</strong>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.7rem',
                          color: item.complainantType === 'Anonymous' ? '#b45309' : '#059669',
                          fontWeight: 500,
                        }}
                      >
                        {item.complainantType === 'Anonymous' ? 'Anonymous' : 'Protected'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.84rem', color: '#243240' }}>{item.caseType}</strong>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#8fa0aa' }}>
                        Dept: {item.department}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#52626d' }}>{item.submittedAt}</span>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: '#1d2935' }}>
                        <span style={{ fontWeight: 500 }}>{item.assignedOfficer}</span>
                      </div>
                    </td>
                    <td>
                      {isClosed ? (
                        <div style={{ fontSize: '0.78rem', color: '#687789' }}>
                          <span>Concluded on target</span>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                            Statutory Compliant
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={13} style={{ color: isUrgent ? '#dc2626' : '#d97706' }} />
                            <strong
                              style={{
                                fontSize: '0.8rem',
                                color: isUrgent ? '#dc2626' : '#1d2935',
                              }}
                            >
                              {item.daysRemaining} days left
                            </strong>
                          </div>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#8fa0aa' }}>
                            Day {item.dayCount} of 90 (Due {item.deadlineDate})
                          </span>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        className="secondary-button"
                        style={{ height: '32px', minHeight: '32px', padding: '0 12px', fontSize: '0.74rem' }}
                        to={`/icc/cases/${item.id}`}
                      >
                        <Eye size={13} style={{ marginRight: '4px' }} /> View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ICCCases
