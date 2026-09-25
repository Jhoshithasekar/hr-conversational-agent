import { useEffect, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import StatusBadge from '../../components/common/StatusBadge'
import {
  approveRequest,
  fetchManagerRequestDetail,
  rejectRequest,
} from '../../api/managerApi'

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return 'Dates pending'
  const start = new Date(startDate).toLocaleDateString()
  const end = new Date(endDate).toLocaleDateString()
  return start === end ? start : `${start} - ${end}`
}

function ManagerRequestDetail({ requestId: propRequestId, onActionSuccess, isModal = false, onClose }) {
  const params = useParams()
  const navigate = useNavigate()
  const activeId = propRequestId || params.id

  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionFeedback, setActionFeedback] = useState(null)

  useEffect(() => {
    if (!activeId) return

    let isCurrent = true

    async function loadDetail() {
      try {
        setLoading(true)
        setError('')
        setActionFeedback(null)
        const data = await fetchManagerRequestDetail(activeId)
        if (isCurrent) {
          setDetail(data)
          if (data.manager_comment) {
            setComment(data.manager_comment)
          }
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message || 'Unable to load request details.')
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    loadDetail()

    return () => {
      isCurrent = false
    }
  }, [activeId])

  const handleAction = async (actionType) => {
    if (!detail) return
    setSubmitting(true)
    setActionFeedback(null)

    try {
      if (actionType === 'approve') {
        const res = await approveRequest(detail.id, comment)
        setActionFeedback({ type: 'success', message: 'Request approved successfully.' })
        setDetail((prev) => ({
          ...prev,
          status: 'Approved',
          manager_comment: res.manager_comment || comment,
        }))
      } else {
        const res = await rejectRequest(detail.id, comment)
        setActionFeedback({ type: 'success', message: 'Request rejected.' })
        setDetail((prev) => ({
          ...prev,
          status: 'Rejected',
          manager_comment: res.manager_comment || comment,
        }))
      }

      if (onActionSuccess) {
        onActionSuccess()
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.message || `Failed to ${actionType} request.`,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={isModal ? 'modal-detail-loading' : 'page-content narrow-content'}>
        <p className="state-message">Loading request details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={isModal ? 'modal-detail-error' : 'page-content narrow-content'}>
        <div className="form-alert form-alert-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
        {!isModal && (
          <Link className="text-link" style={{ marginTop: '16px' }} to="/manager/requests">
            <ArrowLeft size={16} /> Back to team requests
          </Link>
        )}
      </div>
    )
  }

  if (!detail) return null

  const isPending = detail.status.toLowerCase() === 'pending'
  const { employee, leave_balance: leaveBalance, overlapping_requests: overlaps = [], policy_guidance: policies = [] } = detail

  return (
    <div className={isModal ? 'modal-detail-body' : 'page-content narrow-content'}>
      {!isModal && (
        <div style={{ marginBottom: '20px' }}>
          <Link className="text-link" to="/manager/requests">
            <ArrowLeft size={16} /> Back to team requests
          </Link>
        </div>
      )}

      {actionFeedback && (
        <div
          className={`form-alert ${actionFeedback.type === 'success' ? 'form-alert-success' : 'form-alert-error'}`}
          role="status"
          style={{
            marginBottom: '16px',
            background: actionFeedback.type === 'success' ? '#e5f2ec' : '#f8e4e1',
            color: actionFeedback.type === 'success' ? '#27704d' : '#8c4139',
            border: `1px solid ${actionFeedback.type === 'success' ? '#c7e6d7' : '#f1c7be'}`,
          }}
        >
          {actionFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      <div className="panel" style={{ display: 'grid', gap: '22px' }}>
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #edf1ef', paddingBottom: '18px' }}>
          <div>
            <span className="eyebrow" style={{ display: 'block' }}>Request #{detail.id}</span>
            <h2 style={{ margin: '4px 0 0', fontFamily: 'Manrope, sans-serif' }}>
              {detail.request_type}
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <StatusBadge status={detail.status} />
            <p style={{ margin: '6px 0 0', color: '#87949d', fontSize: '0.72rem' }}>
              Submitted {detail.submitted_at ? new Date(detail.submitted_at).toLocaleDateString() : 'Recently'}
            </p>
          </div>
        </div>

        {/* Employee Info Block */}
        <div style={{ background: '#f8faf9', border: '1px solid #dfe6e2', borderRadius: '8px', padding: '14px 16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="avatar avatar-large" style={{ width: '48px', height: '48px', fontSize: '0.95rem' }}>
            {employee.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: '#1d2935' }}>{employee.name}</strong>
            <span style={{ color: '#687789', fontSize: '0.8rem' }}>{employee.role} • {employee.department_name}</span>
          </div>
          <div style={{ color: '#87949d', fontSize: '0.78rem' }}>
            {employee.email}
          </div>
        </div>

        {/* Request Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#fff', border: '1px solid #dfe6e2', borderRadius: '8px', padding: '12px 14px' }}>
            <span style={{ color: '#8fa0aa', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={13} /> Dates
            </span>
            <strong style={{ display: 'block', marginTop: '6px', fontSize: '0.88rem', color: '#1d2935' }}>
              {formatDateRange(detail.start_date, detail.end_date)}
            </strong>
          </div>

          <div style={{ background: '#fff', border: '1px solid #dfe6e2', borderRadius: '8px', padding: '12px 14px' }}>
            <span style={{ color: '#8fa0aa', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} /> Total Duration
            </span>
            <strong style={{ display: 'block', marginTop: '6px', fontSize: '0.88rem', color: '#1d2935' }}>
              {detail.total_days} Day{detail.total_days !== 1 ? 's' : ''} {detail.half_full_day ? `(${detail.half_full_day})` : ''}
            </strong>
          </div>

          {leaveBalance && (
            <div style={{ background: '#fff', border: '1px solid #dfe6e2', borderRadius: '8px', padding: '12px 14px' }}>
              <span style={{ color: '#8fa0aa', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={13} /> {leaveBalance.leave_type} Balance
              </span>
              <strong style={{ display: 'block', marginTop: '6px', fontSize: '0.88rem', color: '#1d2935' }}>
                {leaveBalance.remaining_days} days remaining
              </strong>
              <small style={{ color: '#87949d', fontSize: '0.72rem' }}>
                ({leaveBalance.used_days} used of {leaveBalance.total_entitlement} total)
              </small>
            </div>
          )}
        </div>

        {/* Reason Block */}
        <div>
          <span style={{ color: '#8fa0aa', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Reason for request
          </span>
          <p style={{ background: '#f8faf9', border: '1px solid #edf1ef', borderRadius: '8px', padding: '12px 14px', margin: '6px 0 0', fontSize: '0.86rem', lineHeight: '1.5' }}>
            {detail.reason}
          </p>
        </div>

        {/* Overlap Warning Block */}
        {overlaps.length > 0 ? (
          <div
            style={{
              background: '#fff9ea',
              border: '1px solid #f6e3b2',
              borderRadius: '8px',
              padding: '14px 16px',
              color: '#825619',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertTriangle size={18} style={{ color: '#b57922' }} />
              <strong style={{ fontSize: '0.86rem' }}>Schedule overlap detected in your team</strong>
            </div>
            <p style={{ margin: '0 0 10px', fontSize: '0.78rem' }}>
              The following team member{overlaps.length > 1 ? 's have' : ' has'} overlapping approved or pending requests during this timeframe:
            </p>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem' }}>
              {overlaps.map((o) => (
                <li key={o.request_id} style={{ marginBottom: '4px' }}>
                  <strong>{o.employee_name}</strong>: {o.request_type} ({formatDateRange(o.start_date, o.end_date)}) — <em>{o.status}</em>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div style={{ background: '#f1f7f4', border: '1px solid #d4e8de', borderRadius: '8px', padding: '10px 14px', color: '#27704d', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>No overlapping requests found in your team for this time period.</span>
          </div>
        )}

        {/* Policy Guidance */}
        {policies.length > 0 && (
          <div style={{ background: '#fcfdfd', border: '1px solid #dfe6e2', borderRadius: '8px', padding: '12px 14px' }}>
            <span style={{ color: '#8fa0aa', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FileText size={13} /> Policy guidelines
            </span>
            <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#52626d' }}>
              {policies.map((p, idx) => (
                <div key={idx} style={{ marginBottom: '4px' }}>
                  <strong>{p.title}</strong>: {p.guideline || `Refer to ${p.category} documentation (${p.version || 'latest'}).`}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manager Comment Field & Action Buttons */}
        <div style={{ borderTop: '1px solid #edf1ef', paddingTop: '18px' }}>
          <label htmlFor="manager-comment" style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#52626d' }}>
            <MessageSquare size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '5px' }} />
            Manager comments {isPending ? '(optional for approval, recommended for rejection)' : ''}
          </label>
          <textarea
            disabled={!isPending || submitting}
            id="manager-comment"
            onChange={(e) => setComment(e.target.value)}
            placeholder={isPending ? 'Add a note to the employee explaining your decision...' : 'No comment was provided.'}
            rows={3}
            style={{
              width: '100%',
              background: isPending ? '#fff' : '#f8faf9',
              border: '1px solid #cfdad5',
              borderRadius: '7px',
              padding: '10px 12px',
              fontSize: '0.84rem',
            }}
            value={comment}
          />

          {isPending ? (
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                className="primary-button"
                disabled={submitting}
                onClick={() => handleAction('approve')}
                style={{ background: '#27704d', borderColor: '#27704d' }}
                type="button"
              >
                <CheckCircle2 size={16} style={{ marginRight: '6px' }} />
                {submitting ? 'Processing...' : 'Approve Request'}
              </button>
              <button
                className="secondary-button"
                disabled={submitting}
                onClick={() => handleAction('reject')}
                style={{ color: '#a34b43', borderColor: '#e6c8c4' }}
                type="button"
              >
                <XCircle size={16} style={{ marginRight: '6px' }} />
                {submitting ? 'Processing...' : 'Reject Request'}
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '12px', fontSize: '0.78rem', color: '#687789' }}>
              This request was marked as <strong>{detail.status}</strong>.
            </div>
          )}
        </div>

        {/* Audit Trail */}
        {detail.audit_trail && detail.audit_trail.length > 0 && (
          <div style={{ borderTop: '1px solid #edf1ef', paddingTop: '16px' }}>
            <span style={{ color: '#8fa0aa', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Audit History
            </span>
            <div style={{ marginTop: '8px', display: 'grid', gap: '6px' }}>
              {detail.audit_trail.map((item) => (
                <div key={item.id} style={{ fontSize: '0.75rem', color: '#687789', background: '#f8faf9', padding: '6px 10px', borderRadius: '5px' }}>
                  <strong>{item.actor_name}</strong> performed <code>{item.action}</code> ({item.approver_action || item.status}) on{' '}
                  {new Date(item.timestamp).toLocaleString()}
                  {item.comment ? ` - "${item.comment}"` : ''}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManagerRequestDetail

