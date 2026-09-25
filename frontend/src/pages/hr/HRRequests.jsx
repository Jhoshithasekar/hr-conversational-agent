import { useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  FileCheck,
  X,
  XCircle,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import StatusBadge from '../../components/common/StatusBadge'
import FilterBar from '../../components/common/FilterBar'
import EmptyState from '../../components/common/EmptyState'
import { initialHrRequests } from '../../data/hrMockData'

function HRRequests() {
  const [searchParams] = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'

  const [requests, setRequests] = useState(initialHrRequests)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [typeFilter, setTypeFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // State for Review Modal
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [hrComment, setHrComment] = useState('')
  const [actionNotice, setActionNotice] = useState(null)

  const handleStatusChange = (status) => {
    setStatusFilter(status)
  }

  const handleReviewClick = (req) => {
    setSelectedRequest(req)
    setHrComment('')
    setActionNotice(null)
  }

  const handleAction = (newStatus) => {
    if (!selectedRequest) return

    setRequests((prev) =>
      prev.map((item) =>
        item.id === selectedRequest.id
          ? {
              ...item,
              status: newStatus,
              hrComment: hrComment.trim() || undefined,
            }
          : item
      )
    )

    setActionNotice({
      type: 'success',
      message: `Request #${selectedRequest.id} marked as ${newStatus}.`,
    })

    setSelectedRequest((prev) => ({
      ...prev,
      status: newStatus,
      hrComment: hrComment.trim() || undefined,
    }))
  }

  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== 'all' && req.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false
    }
    if (typeFilter !== 'all' && req.requestType.toLowerCase() !== typeFilter.toLowerCase()) {
      return false
    }
    if (deptFilter !== 'all' && req.department.toLowerCase() !== deptFilter.toLowerCase()) {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = req.employeeName.toLowerCase().includes(q)
      const matchType = req.requestType.toLowerCase().includes(q)
      const matchDept = req.department.toLowerCase().includes(q)
      const matchReason = req.reason.toLowerCase().includes(q)
      if (!matchName && !matchType && !matchDept && !matchReason) return false
    }
    return true
  })

  const statusTabs = [
    { label: 'All Requests', value: 'all' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Under Review', value: 'Under Review' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ]

  const requestTypes = [
    { label: 'All Types', value: 'all' },
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'Casual Leave', value: 'Casual Leave' },
    { label: 'Earned Leave', value: 'Earned Leave' },
    { label: 'Work from home', value: 'Work from home' },
  ]

  const departments = [
    { label: 'All Departments', value: 'all' },
    { label: 'Engineering', value: 'Engineering' },
    { label: 'Product', value: 'Product' },
    { label: 'Design', value: 'Design' },
    { label: 'Marketing', value: 'Marketing' },
  ]

  return (
    <div className="page-content">
      <div className="section-heading" style={{ marginBottom: '20px' }}>
        <div>
          <p className="eyebrow">Administration</p>
          <h2>Requests & Approvals</h2>
        </div>
        <span className="section-note">
          {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} listed
        </span>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        activeTab={statusFilter}
        onSearchChange={setSearchQuery}
        onSelectChange={setTypeFilter}
        onTabChange={handleStatusChange}
        searchPlaceholder="Search by employee, department, or keyword..."
        searchValue={searchQuery}
        selectLabel="Filter by type"
        selectOptions={requestTypes}
        selectValue={typeFilter}
        tabs={statusTabs}
      >
        <div className="filter-select-wrap">
          <select
            aria-label="Filter by department"
            className="filter-select"
            onChange={(e) => setDeptFilter(e.target.value)}
            value={deptFilter}
          >
            {departments.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      {/* Request Table / List */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          description="Try adjusting your search criteria or filter options above."
          icon="clock"
          title="No matching requests found"
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Request Type</th>
                <th>Dates & Duration</th>
                <th>Submitted</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar avatar-small">
                        {req.employeeName.slice(0, 1)}
                      </div>
                      <div>
                        <strong>{req.employeeName}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#87949d' }}>
                          {req.employeeRole} • {req.department}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{req.requestType}</strong>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: '#1d2935' }}>{req.dates}</div>
                    <small style={{ color: '#87949d' }}>{req.duration}</small>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#687789' }}>
                    {req.submittedAt}
                  </td>
                  <td>
                    <StatusBadge status={req.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="secondary-button"
                      onClick={() => handleReviewClick(req)}
                      style={{ height: '34px', minHeight: '34px', padding: '0 12px', fontSize: '0.76rem' }}
                      type="button"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Request Detail Review Modal */}
      {selectedRequest && (
        <div className="modal-backdrop" role="dialog">
          <div className="modal-container" style={{ maxWidth: '720px' }}>
            <button
              aria-label="Close modal"
              className="modal-close-btn"
              onClick={() => setSelectedRequest(null)}
              type="button"
            >
              <X size={20} />
            </button>

            {actionNotice && (
              <div
                className="form-alert"
                style={{
                  background: '#e5f2ec',
                  color: '#27704d',
                  border: '1px solid #c7e6d7',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{actionNotice.message}</span>
              </div>
            )}

            {/* Modal Header */}
            <div style={{ borderBottom: '1px solid #edf1ef', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="eyebrow">HR Request Evaluation</span>
                  <h2 style={{ margin: '4px 0 0', fontFamily: 'Manrope, sans-serif' }}>
                    {selectedRequest.requestType} (#{selectedRequest.id})
                  </h2>
                </div>
                <StatusBadge status={selectedRequest.status} />
              </div>
            </div>

            {/* Employee Information */}
            <div style={{ background: '#f8faf9', border: '1px solid #dfe6e2', borderRadius: '8px', padding: '14px 16px', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <div className="avatar avatar-large" style={{ width: '48px', height: '48px', fontSize: '1rem' }}>
                {selectedRequest.employeeName.slice(0, 1)}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 2px', fontSize: '1rem', fontFamily: 'Manrope, sans-serif' }}>
                  {selectedRequest.employeeName}
                </h3>
                <p style={{ margin: '0', fontSize: '0.8rem', color: '#687789' }}>
                  {selectedRequest.employeeRole} • {selectedRequest.department}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#87949d' }}>
                  Reporting Manager: <strong>{selectedRequest.managerName}</strong>
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.74rem', color: '#87949d' }}>
                <span>Submitted: {selectedRequest.submittedAt}</span>
              </div>
            </div>

            {/* Request Dates & Reason */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#fff', border: '1px solid #dfe6e2', borderRadius: '8px', padding: '12px 14px' }}>
                <span style={{ color: '#8fa0aa', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> Schedule & Duration
                </span>
                <strong style={{ display: 'block', marginTop: '6px', fontSize: '0.88rem', color: '#1d2935' }}>
                  {selectedRequest.dates}
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#687789' }}>{selectedRequest.duration}</span>
              </div>

              <div style={{ background: '#fff', border: '1px solid #dfe6e2', borderRadius: '8px', padding: '12px 14px' }}>
                <span style={{ color: '#8fa0aa', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileCheck size={14} /> Current Status
                </span>
                <strong style={{ display: 'block', marginTop: '6px', fontSize: '0.88rem', color: '#1d2935' }}>
                  {selectedRequest.status}
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#687789' }}>HR queue stage</span>
              </div>
            </div>

            {/* Reason Block */}
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#8fa0aa', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Employee Reason
              </span>
              <p style={{ background: '#f8faf9', border: '1px solid #edf1ef', borderRadius: '8px', padding: '12px 14px', margin: '6px 0 0', fontSize: '0.86rem', lineHeight: '1.5' }}>
                &quot;{selectedRequest.reason}&quot;
              </p>
            </div>

            {/* Policy Reference Area */}
            <div style={{ marginBottom: '18px', background: '#fdfbf9', border: '1px solid #f2e7de', borderRadius: '8px', padding: '12px 14px' }}>
              <span style={{ color: '#a5563f', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCheck size={14} /> Policy Compliance Reference
              </span>
              <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#52626d', lineHeight: '1.45' }}>
                {selectedRequest.policyReference}
              </p>
            </div>

            {/* Manager Comments */}
            {selectedRequest.managerComment && (
              <div style={{ marginBottom: '20px', background: '#f8faf9', border: '1px solid #edf1ef', borderRadius: '8px', padding: '12px 14px' }}>
                <span style={{ color: '#687789', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Reporting Manager Recommendation
                </span>
                <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#27704d', fontStyle: 'italic' }}>
                  &quot;{selectedRequest.managerComment}&quot;
                </p>
              </div>
            )}

            {/* HR Action Area */}
            <div style={{ borderTop: '1px solid #edf1ef', paddingTop: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1d2935', marginBottom: '6px' }}>
                HR Action Notes / Decision Remarks
              </label>
              <textarea
                onChange={(e) => setHrComment(e.target.value)}
                placeholder="Add compliance notes or decision rationale..."
                rows={3}
                style={{
                  width: '100%',
                  border: '1px solid #cfdad5',
                  borderRadius: '7px',
                  padding: '10px 12px',
                  fontSize: '0.84rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
                value={hrComment}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  className="secondary-button"
                  onClick={() => setSelectedRequest(null)}
                  type="button"
                >
                  Close
                </button>
                <button
                  className="secondary-button"
                  onClick={() => handleAction('Under Review')}
                  style={{ color: '#3553a2', borderColor: '#cfdad5' }}
                  type="button"
                >
                  Mark Under Review
                </button>
                <button
                  className="secondary-button"
                  onClick={() => handleAction('Rejected')}
                  style={{ color: '#a34b43', borderColor: '#f1c7be' }}
                  type="button"
                >
                  <XCircle size={15} style={{ marginRight: '6px' }} />
                  Reject Request
                </button>
                <button
                  className="primary-button"
                  onClick={() => handleAction('Approved')}
                  type="button"
                >
                  <CheckCircle2 size={15} style={{ marginRight: '6px' }} />
                  Approve Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HRRequests
