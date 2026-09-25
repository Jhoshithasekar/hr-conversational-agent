import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import StatusBadge from '../../components/common/StatusBadge'
import StatCard from '../../components/common/StatCard'
import EmptyState from '../../components/common/EmptyState'
import { iccDashboardMetrics, initialIccCases } from '../../data/iccMockData'

function ICCDashboard() {
  const [cases] = useState(initialIccCases)
  const [metrics] = useState(iccDashboardMetrics)

  // Cases requiring attention: cases with daysRemaining <= 30 or status 'Hearing Scheduled' / 'Report Pending'
  const attentionCases = cases.filter(
    (c) => c.status === 'Report Pending' || c.status === 'Hearing Scheduled' || c.daysRemaining <= 20
  )

  return (
    <div className="page-content">
      {/* Confidentiality Notice Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#fcf8ec',
          border: '1px solid #fae6b2',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '22px',
        }}
      >
        <Lock size={18} style={{ color: '#b45309', flexShrink: 0 }} />
        <div style={{ fontSize: '0.82rem', color: '#92400e' }}>
          <strong>Restricted Committee Access:</strong> This workspace contains legally privileged and confidential
          records governed by the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act,
          2013. Unauthorized disclosure is strictly prohibited under Section 16 of the POSH Act.
        </div>
      </div>

      {/* Summary Cards using StatCard */}
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Statutory Inquiry Metrics</p>
            <h2>Committee Caseload Overview</h2>
          </div>
          <span className="section-note">Active proceedings tracking</span>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <StatCard
            icon={Scale}
            label="Open Cases"
            linkLabel="View all cases"
            linkTo="/icc/cases"
            subtext="active proceedings"
            tone="teal"
            value={metrics.openCases}
          />

          <StatCard
            icon={AlertTriangle}
            label="Approaching 90-Day Limit"
            linkLabel="Review urgent cases"
            linkTo="/icc/cases/ICC-2026-003"
            subtext="statutory limit alert"
            tone="coral"
            value={metrics.approaching90DayDeadline}
          />

          <StatCard
            footnote="Statutory records archived"
            icon={CheckCircle2}
            label="Concluded Inquiries"
            subtext="closed cases"
            tone="gold"
            value={metrics.closedCases}
          />
        </div>
      </section>

      {/* Main Grid: Cases Requiring Attention & 90-Day Statutory Timeline Overview */}
      <div className="dashboard-grid">
        {/* Left Column: Cases Requiring Attention */}
        <div>
          <section className="section-block requests-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Urgent docket</p>
                <h2>Cases Requiring Attention</h2>
              </div>
              <Link className="text-link" to="/icc/cases">
                View all cases ({cases.length}) <ArrowRight size={16} />
              </Link>
            </div>

            {attentionCases.length === 0 ? (
              <EmptyState
                description="All ongoing committee inquiries are currently progressing on schedule."
                icon="check"
                title="No urgent cases"
              />
            ) : (
              <div className="request-list">
                {attentionCases.map((item) => (
                  <article className="request-card" key={item.id}>
                    <div
                      className="request-icon"
                      style={{
                        background: '#f8faf9',
                        color: '#687789',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Scale size={18} />
                    </div>
                    <div className="request-details" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong>{item.id}</strong>
                        <span style={{ fontSize: '0.72rem', color: '#8fa0aa' }}>({item.department})</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#52626d' }}>
                        {item.caseType} • Assigned: {item.assignedOfficer}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 600 }}>
                        {item.daysRemaining} days remaining in 90-day statutory window
                      </span>
                    </div>
                    <div className="request-date" style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                        Due {item.deadlineDate}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#8fa0aa' }}>Submitted: {item.submittedAt}</span>
                    </div>
                    <StatusBadge status={item.status} />
                    <Link
                      aria-label={`Open confidential case ${item.id}`}
                      className="row-action"
                      to={`/icc/cases/${item.id}`}
                    >
                      <ArrowRight aria-hidden="true" size={17} />
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Statutory 90-Day Timeline Monitor */}
          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">POSH Compliance</p>
                <h2>Statutory 90-Day Timeline Tracker</h2>
              </div>
            </div>

            <div className="panel" style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {cases
                  .filter((c) => c.status !== 'Closed')
                  .map((c) => {
                    const percentage = Math.min(100, Math.round((c.dayCount / 90) * 100))
                    const isUrgent = c.daysRemaining <= 10

                    return (
                      <div key={c.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong>{c.id}</strong>
                            <span style={{ fontSize: '0.74rem', color: '#687789' }}>({c.caseType})</span>
                          </span>
                          <span style={{ fontSize: '0.76rem', color: isUrgent ? '#dc2626' : '#687789', fontWeight: 600 }}>
                            Day {c.dayCount} of 90 ({c.daysRemaining} days left)
                          </span>
                        </div>
                        <div className="progress-track" style={{ height: '7px' }}>
                          <span
                            style={{
                              width: `${percentage}%`,
                              background: isUrgent ? '#c46b4f' : percentage > 60 ? '#d19a4a' : '#5c9a8f',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Committee Quick Actions & POSH Statutory Guidance */}
        <div>
          {/* Quick Actions */}
          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Shortcuts</p>
                <h2>Committee Actions</h2>
              </div>
            </div>

            <div className="quick-action-list">
              <Link className="quick-action" to="/icc/cases">
                <div className="quick-action-icon">
                  <Scale size={16} />
                </div>
                <span>
                  <strong>Confidential Case Registry</strong>
                  <small>Access active and closed inquiry proceedings</small>
                </span>
                <ArrowRight size={16} />
              </Link>

              <Link className="quick-action" to="/icc/cases/ICC-2026-003">
                <div className="quick-action-icon">
                  <AlertTriangle size={16} />
                </div>
                <span>
                  <strong>Urgent Case (ICC-2026-003)</strong>
                  <small>Review case nearing statutory 90-day deadline</small>
                </span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* Statutory POSH Reference Card */}
          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Legal Framework</p>
                <h2>POSH Act Guidelines</h2>
              </div>
            </div>

            <article className="panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <ShieldCheck size={20} style={{ color: '#27704d' }} />
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#1d2935' }}>
                    Statutory Timelines & Compliance
                  </strong>
                  <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#687789' }}>
                    In accordance with POSH Act, 2013
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '10px', fontSize: '0.78rem', color: '#52626d' }}>
                <div style={{ background: '#f8faf9', padding: '10px 12px', borderRadius: '6px' }}>
                  <strong style={{ color: '#1d2935', display: 'block', marginBottom: '2px' }}>
                    90-Day Completion Mandate
                  </strong>
                  The inquiry must be completed within a period of 90 days from the date of formal complaint receipt.
                </div>
                <div style={{ background: '#f8faf9', padding: '10px 12px', borderRadius: '6px' }}>
                  <strong style={{ color: '#1d2935', display: 'block', marginBottom: '2px' }}>
                    10-Day Report Submission
                  </strong>
                  The ICC must provide the inquiry report to the employer within 10 days of completion of inquiry.
                </div>
                <div style={{ background: '#f8faf9', padding: '10px 12px', borderRadius: '6px' }}>
                  <strong style={{ color: '#1d2935', display: 'block', marginBottom: '2px' }}>
                    Section 16 Confidentiality
                  </strong>
                  Contents of complaints, identity of complainant, respondent, and witnesses must not be published.
                </div>
              </div>
            </article>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ICCDashboard
