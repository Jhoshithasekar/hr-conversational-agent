import { useState } from 'react'
import {
  Clock,
  Download,
  Lock,
  ShieldCheck,
} from 'lucide-react'

import FilterBar from '../../components/common/FilterBar'
import EmptyState from '../../components/common/EmptyState'
import { initialHrAuditLogs } from '../../data/hrMockData'

function HRAuditLog() {
  const [logs] = useState(initialHrAuditLogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(10)

  const distinctActions = Array.from(new Set(logs.map((l) => l.action)))
  const distinctUsers = Array.from(new Set(logs.map((l) => l.user)))

  const actionOptions = [
    { label: 'All Actions', value: 'all' },
    ...distinctActions.map((a) => ({ label: a, value: a })),
  ]

  const userOptions = [
    { label: 'All Users', value: 'all' },
    ...distinctUsers.map((u) => ({ label: u, value: u })),
  ]

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) {
      return false
    }
    if (userFilter !== 'all' && log.user !== userFilter) {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchUser = log.user.toLowerCase().includes(q)
      const matchAction = log.action.toLowerCase().includes(q)
      const matchResource = log.resource.toLowerCase().includes(q)
      const matchIp = log.ipAddress.toLowerCase().includes(q)
      if (!matchUser && !matchAction && !matchResource && !matchIp) return false
    }
    return true
  })

  const displayedLogs = filteredLogs.slice(0, visibleCount)

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Timestamp,User,User Role,Action,Resource,Status,IP']
        .concat(
          filteredLogs.map(
            (l) =>
              `"${l.id}","${l.timestamp}","${l.user}","${l.userRole}","${l.action}","${l.resource}","${l.status}","${l.ipAddress}"`
          )
        )
        .join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `hr_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="page-content">
      {/* Privacy Notice Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#f4fbf7',
          border: '1px solid #cce8d9',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <Lock size={18} style={{ color: '#166534', flexShrink: 0 }} />
        <div style={{ fontSize: '0.82rem', color: '#166534' }}>
          <strong>Statutory Privacy Protection:</strong> In compliance with the POSH Act 2013 and workplace
          confidentiality policies, all sensitive POSH inquiry dockets and ICC grievance logs are strictly
          segregated and accessible solely within the authorized ICC Workspace.
        </div>
      </div>

      <div className="section-heading" style={{ marginBottom: '20px' }}>
        <div>
          <p className="eyebrow">Enterprise Audit Trail</p>
          <h2>System Activity Records</h2>
        </div>
        <span className="section-note">
          {filteredLogs.length} record{filteredLogs.length !== 1 ? 's' : ''} logged
        </span>
      </div>

      {/* Filter and Control Bar using FilterBar */}
      <FilterBar
        onSearchChange={setSearchQuery}
        onSelectChange={setActionFilter}
        searchPlaceholder="Search user, action, resource, or IP..."
        searchValue={searchQuery}
        selectLabel="Filter by action"
        selectOptions={actionOptions}
        selectValue={actionFilter}
      >
        <div className="filter-select-wrap">
          <select
            aria-label="Filter by user"
            className="filter-select"
            onChange={(e) => setUserFilter(e.target.value)}
            value={userFilter}
          >
            {userOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className="secondary-button"
          onClick={handleExport}
          style={{ height: '38px', minHeight: '38px', padding: '0 14px', fontSize: '0.78rem' }}
          type="button"
        >
          <Download size={15} style={{ marginRight: '6px' }} />
          Export CSV
        </button>
      </FilterBar>

      {/* Audit Log Table */}
      {displayedLogs.length === 0 ? (
        <EmptyState
          description="No audit records match your current search query or filter selection."
          icon="clock"
          title="No audit log entries found"
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Log ID</th>
                <th style={{ width: '180px' }}>Timestamp</th>
                <th>Actor / User</th>
                <th>Action Performed</th>
                <th>Resource Affected</th>
                <th style={{ width: '100px' }}>Status</th>
                <th style={{ width: '130px' }}>IP / Source</th>
              </tr>
            </thead>
            <tbody>
              {displayedLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <code style={{ fontSize: '0.78rem', color: '#52626d' }}>{log.id}</code>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                      <Clock size={13} style={{ color: '#8fa0aa' }} />
                      <span>{log.timestamp}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '0.86rem', color: '#1d2935' }}>{log.user}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#687789' }}>{log.userRole}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: '#243240',
                      }}
                    >
                      <ShieldCheck size={14} style={{ color: '#1d7353' }} />
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: '#3b4b59' }}>{log.resource}</span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        log.status === 'Success'
                          ? 'approved'
                          : log.status === 'Warning'
                          ? 'rejected'
                          : 'pending'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.76rem', color: '#687789' }}>{log.ipAddress}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Load More Pagination */}
      {filteredLogs.length > visibleCount && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            className="secondary-button"
            onClick={() => setVisibleCount((prev) => prev + 10)}
            style={{ minWidth: '160px' }}
            type="button"
          >
            Load More Logs ({filteredLogs.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  )
}

export default HRAuditLog
