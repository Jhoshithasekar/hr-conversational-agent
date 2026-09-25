import { useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  Lock,
  Shield,
  ShieldAlert,
  UserCheck,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import StatusBadge from '../../components/common/StatusBadge'
import { initialIccCases } from '../../data/iccMockData'

function ICCCaseDetail() {
  const { id } = useParams()

  // Match case from data
  const [allCases, setAllCases] = useState(initialIccCases)
  const cleanId = (id || '').trim().toLowerCase()
  const currentCase = allCases.find((c) => {
    const cid = c.id.toLowerCase()
    if (cid === cleanId) return true
    if (cid.endsWith(`-${cleanId.padStart(3, '0')}`)) return true
    if (cid.endsWith(`-${cleanId}`)) return true
    const numMatch = cid.match(/(\d+)$/)
    if (numMatch && /^\d+$/.test(cleanId) && parseInt(numMatch[1], 10) === parseInt(cleanId, 10)) {
      return true
    }
    return false
  })

  // Local state for actions
  const [newStatus, setNewStatus] = useState(currentCase?.status || 'Under Inquiry')
  const [actionNote, setActionNote] = useState('')
  const [actionNotice, setActionNotice] = useState(null)
  const [activityLogs, setActivityLogs] = useState(currentCase?.caseActivity || [])

  if (!currentCase) {
    return (
      <div className="page-content">
        <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
          <ShieldAlert size={48} style={{ color: '#c0392b', marginBottom: '16px' }} />
          <h2>Confidential Docket Not Found</h2>
          <p style={{ color: '#687789', maxWidth: '440px', margin: '0 auto 20px' }}>
            The case identifier <code>{id}</code> could not be located in the confidential ICC registry or access has been restricted.
          </p>
          <Link className="primary-button" to="/icc/cases">
            Return to Case Registry
          </Link>
        </div>
      </div>
    )
  }

  const handleUpdateStatus = (e) => {
    e.preventDefault()
    if (!actionNote.trim()) {
      setActionNotice({ type: 'error', message: 'A confidential committee action note is required.' })
      return
    }

    const updatedLog = {
      id: activityLogs.length + 1,
      timestamp: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      member: currentCase.assignedOfficer,
      action: `Status updated to ${newStatus}`,
      note: actionNote.trim(),
    }

    setActivityLogs([updatedLog, ...activityLogs])
    setAllCases((prev) =>
      prev.map((c) => (c.id === currentCase.id ? { ...c, status: newStatus } : c))
    )

    setActionNotice({
      type: 'success',
      message: `Case status successfully updated to "${newStatus}" and committee log recorded.`,
    })
    setActionNote('')
  }

  const isClosed = currentCase.status === 'Closed'
  const progressPct = Math.min(100, Math.round((currentCase.dayCount / 90) * 100))
  const isUrgent = !isClosed && currentCase.daysRemaining <= 10

  return (
    <div className="page-content">
      {/* Back and Breadcrumb Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <Link
          className="text-link"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 600 }}
          to="/icc/cases"
        >
          <ArrowLeft size={16} /> Back to Case Registry
        </Link>
        <span
          style={{
            fontSize: '0.74rem',
            color: '#b45309',
            background: '#fef3c7',
            padding: '3px 10px',
            borderRadius: '12px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Lock size={12} /> RESTRICTED PRIVILEGED INQUIRY
        </span>
      </div>

      {/* Case Header Banner */}
      <div
        className="panel"
        style={{
          padding: '20px 24px',
          marginBottom: '22px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#1d2935' }}>{currentCase.id}</h2>
            <StatusBadge status={currentCase.status} />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#52626d' }}>
            {currentCase.caseType} • Filed on {currentCase.submittedAt} • Department: {currentCase.department}
          </p>
        </div>

        {/* 90-Day Tracker pill in header */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '10px 16px',
            borderRadius: '8px',
            textAlign: 'right',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
            <Clock size={14} style={{ color: isUrgent ? '#dc2626' : '#d97706' }} />
            <strong style={{ fontSize: '0.86rem', color: isUrgent ? '#dc2626' : '#1d2935' }}>
              {isClosed ? 'Concluded' : `${currentCase.daysRemaining} days remaining`}
            </strong>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#8fa0aa' }}>
            Statutory 90-Day Deadline: {currentCase.deadlineDate}
          </span>
        </div>
      </div>

      {actionNotice && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '6px',
            background: actionNotice.type === 'success' ? '#e8f3ef' : '#f8e4e1',
            border: `1px solid ${actionNotice.type === 'success' ? '#c2e0d3' : '#f1c7be'}`,
            color: actionNotice.type === 'success' ? '#2d6a4f' : '#8c4139',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.86rem',
          }}
        >
          {actionNotice.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* 4 Organised Sections */}
      <div className="dashboard-grid">
        {/* Left Column: Section 1 (Case Overview) & Section 3 (Evidence & Depositions) */}
        <div style={{ display: 'grid', gap: '22px' }}>
          {/* SECTION 1: Case Overview & Particulars */}
          <section className="section-block" style={{ margin: 0 }}>
            <div className="section-heading" style={{ marginBottom: '12px' }}>
              <div>
                <p className="eyebrow">Particulars</p>
                <h2>1. Case Overview</h2>
              </div>
              <span className="section-note">Confidential file</span>
            </div>

            <div className="panel" style={{ padding: '20px', display: 'grid', gap: '16px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '14px',
                }}
              >
                <div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 600 }}>
                    Complainant Status
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Shield size={14} style={{ color: currentCase.complainantType === 'Anonymous' ? '#b45309' : '#059669' }} />
                    <strong style={{ fontSize: '0.86rem', color: '#1d2935' }}>
                      {currentCase.complainantDisplayName} ({currentCase.complainantType})
                    </strong>
                  </div>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 600 }}>
                    Respondent
                  </span>
                  <strong style={{ display: 'block', fontSize: '0.86rem', color: '#1d2935', marginTop: '4px' }}>
                    {currentCase.respondentName}
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: '#687789' }}>{currentCase.respondentRole}</span>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 600 }}>
                    Incident Period
                  </span>
                  <strong style={{ display: 'block', fontSize: '0.86rem', color: '#1d2935', marginTop: '4px' }}>
                    {currentCase.incidentDatePeriod}
                  </strong>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 600 }}>
                    Location / Channel
                  </span>
                  <strong style={{ display: 'block', fontSize: '0.86rem', color: '#1d2935', marginTop: '4px' }}>
                    {currentCase.locationChannel}
                  </strong>
                </div>
              </div>

              {/* Incident Description */}
              <div style={{ borderTop: '1px solid #edf1ef', paddingTop: '14px' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                  Privileged Statement of Incident
                </span>
                <div
                  style={{
                    background: '#f8fafc',
                    borderLeft: '4px solid #059669',
                    padding: '14px 16px',
                    borderRadius: '0 8px 8px 0',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#243240', lineHeight: 1.6 }}>
                    &quot;{currentCase.description}&quot;
                  </p>
                </div>
              </div>

              {/* Assigned Officer */}
              <div
                style={{
                  background: '#f8faf9',
                  border: '1px solid #dfe6e2',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#def7ec',
                    color: '#03543f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserCheck size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#1d2935', display: 'block' }}>
                    Assigned Officer: {currentCase.assignedOfficer}
                  </strong>
                  <span style={{ fontSize: '0.74rem', color: '#687789' }}>
                    Officer ID: ICC-OFF-00{currentCase.assignedOfficerId} • Designated Presiding Authority
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: Evidence, Depositions & Confidential Files */}
          <section className="section-block" style={{ margin: 0 }}>
            <div className="section-heading" style={{ marginBottom: '12px' }}>
              <div>
                <p className="eyebrow">Documentation</p>
                <h2>3. Evidence & Depositions ({currentCase.evidenceFiles?.length || 0})</h2>
              </div>
              <span className="section-note">Encrypted evidence repository</span>
            </div>

            <div className="panel" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'grid', gap: '10px' }}>
                {currentCase.evidenceFiles?.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #edf1ef',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} style={{ color: '#059669', flexShrink: 0 }} />
                      <div>
                        <strong style={{ fontSize: '0.84rem', color: '#1d2935' }}>{file.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#8fa0aa' }}>
                          Size: {file.size} • Attached: {file.date}
                        </span>
                      </div>
                    </div>
                    <button
                      className="secondary-button"
                      onClick={() => alert(`Simulated secure preview of: ${file.name}`)}
                      style={{ height: '32px', minHeight: '32px', padding: '0 10px', fontSize: '0.74rem' }}
                      type="button"
                    >
                      <Download size={13} style={{ marginRight: '4px' }} /> Access File
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Section 2 (90-Day Timeline) & Section 4 (Committee Actions) */}
        <div style={{ display: 'grid', gap: '22px' }}>
          {/* SECTION 2: 90-Day Statutory Timeline */}
          <section className="section-block" style={{ margin: 0 }}>
            <div className="section-heading" style={{ marginBottom: '12px' }}>
              <div>
                <p className="eyebrow">POSH Compliance</p>
                <h2>2. 90-Day Statutory Timeline</h2>
              </div>
              <span className="section-note">Day {currentCase.dayCount} of 90</span>
            </div>

            <div className="panel" style={{ padding: '20px' }}>
              {/* Progress Bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.76rem', color: '#687789' }}>Statutory Progress</span>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: isUrgent ? '#dc2626' : '#059669',
                    }}
                  >
                    {progressPct}% ({currentCase.dayCount} / 90 Days)
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    background: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPct}%`,
                      background: isUrgent ? '#dc2626' : progressPct > 65 ? '#d97706' : '#059669',
                    }}
                  />
                </div>
              </div>

              {/* Milestones Timeline */}
              <div className="timeline-track">
                {currentCase.timelineMilestones?.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      position: 'relative',
                      paddingBottom: idx === currentCase.timelineMilestones.length - 1 ? 0 : '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background:
                          m.status === 'Completed'
                            ? '#def7ec'
                            : m.status === 'In Progress'
                            ? '#fef3c7'
                            : '#f1f5f9',
                        color:
                          m.status === 'Completed'
                            ? '#03543f'
                            : m.status === 'In Progress'
                            ? '#b45309'
                            : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {m.status === 'Completed' ? '✓' : m.day}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.82rem', color: '#1d2935' }}>{m.title}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#8fa0aa' }}>{m.date}</span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#687789' }}>
                        {m.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 4: Committee Actions & Activity Log */}
          <section className="section-block" style={{ margin: 0 }}>
            <div className="section-heading" style={{ marginBottom: '12px' }}>
              <div>
                <p className="eyebrow">Governance</p>
                <h2>4. Committee Actions & Log</h2>
              </div>
            </div>

            <div className="panel" style={{ padding: '20px', display: 'grid', gap: '16px' }}>
              <form onSubmit={handleUpdateStatus} style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label
                    htmlFor="icc-status-select"
                    style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4a5b68', marginBottom: '6px' }}
                  >
                    Update Case Status
                  </label>
                  <select
                    className="filter-select"
                    id="icc-status-select"
                    onChange={(e) => setNewStatus(e.target.value)}
                    style={{ width: '100%', height: '38px' }}
                    value={newStatus}
                  >
                    <option value="Under Inquiry">Under Inquiry</option>
                    <option value="Hearing Scheduled">Hearing Scheduled</option>
                    <option value="Report Pending">Report Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="icc-action-note"
                    style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4a5b68', marginBottom: '6px' }}
                  >
                    Confidential Committee Note
                  </label>
                  <textarea
                    id="icc-action-note"
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="Enter formal notes regarding notice served, deposition recorded, or hearing disposition..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cfdad5',
                      borderRadius: '7px',
                      fontSize: '0.84rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                    value={actionNote}
                  />
                </div>

                <button
                  className="primary-button"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  type="submit"
                >
                  <FileCheck size={16} /> Record Committee Action
                </button>
              </form>

              {/* Activity Trail */}
              <div style={{ borderTop: '1px solid #edf1ef', paddingTop: '14px' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
                  Case Activity Trail
                </span>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        background: '#f8faf9',
                        border: '1px solid #edf1ef',
                        borderRadius: '6px',
                        padding: '10px 12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.82rem', color: '#1d2935' }}>{log.action}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#8fa0aa' }}>{log.timestamp}</span>
                      </div>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#059669', fontWeight: 500, marginTop: '2px' }}>
                        Recorded by: {log.member}
                      </span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: '#52626d' }}>
                        {log.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ICCCaseDetail
