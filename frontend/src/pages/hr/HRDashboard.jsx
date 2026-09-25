import { useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  LineChart,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import StatusBadge from '../../components/common/StatusBadge'
import StatCard from '../../components/common/StatCard'
import EmptyState from '../../components/common/EmptyState'
import {
  initialHrRequests,
  prototypeDocuments,
  hrRecentActivity,
} from '../../data/hrMockData'

function HRDashboard() {
  const [requests] = useState(initialHrRequests)
  const pendingRequests = requests.filter((r) => r.status === 'Pending' || r.status === 'Under Review')
  const activePoliciesCount = prototypeDocuments.filter((d) => d.status === 'Active').length

  return (
    <div className="page-content">
      {/* Overview Stat Cards */}
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Organization metrics</p>
            <h2>HR Workspace Overview</h2>
          </div>
          <span className="section-note">Live operations status</span>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <StatCard
            icon={Clock}
            label="Pending Requests"
            linkLabel="Review pending items"
            linkTo="/hr/requests?status=Pending"
            subtext="awaiting HR action"
            tone="coral"
            value={pendingRequests.length}
          />

          <StatCard
            footnote="Includes leaves and remote work"
            icon={Calendar}
            label="Requests Today"
            subtext="new submissions"
            tone="teal"
            value={6}
          />

          <StatCard
            icon={BookOpen}
            label="Active Policies"
            linkLabel="Knowledge Base"
            linkTo="/hr/knowledge-base"
            subtext="policies published"
            tone="gold"
            value={activePoliciesCount}
          />

          <StatCard
            footnote="General workplace inquiries"
            icon={Shield}
            label="Open Inquiries"
            subtext="operational queries"
            tone="teal"
            value={2}
          />
        </div>
      </section>

      {/* Main Grid: Requests Requiring Attention (Left) & Quick Actions / Knowledge Base (Right) */}
      <div className="dashboard-grid">
        {/* Left Column: Requests Requiring Attention */}
        <div>
          <section className="section-block requests-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Priority tasks</p>
                <h2>Requests Requiring Attention</h2>
              </div>
              <Link className="text-link" to="/hr/requests">
                View all ({requests.length}) <ArrowRight size={16} />
              </Link>
            </div>

            {pendingRequests.length === 0 ? (
              <EmptyState
                description="All submitted employee requests have been processed."
                icon="check"
                title="All requests processed"
              />
            ) : (
              <div className="request-list">
                {pendingRequests.slice(0, 4).map((req) => (
                  <article className="request-card" key={req.id}>
                    <div className="request-icon">
                      {req.employeeName.slice(0, 1)}
                    </div>
                    <div className="request-details" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong>{req.employeeName}</strong>
                        <span style={{ fontSize: '0.72rem', color: '#87949d' }}>({req.department})</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#52626d' }}>
                        {req.requestType} • {req.duration}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#8fa0aa' }}>
                        &quot;{req.reason}&quot;
                      </span>
                    </div>
                    <div className="request-date" style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>{req.dates}</span>
                      <span style={{ fontSize: '0.68rem', color: '#8fa0aa' }}>{req.submittedAt}</span>
                    </div>
                    <StatusBadge status={req.status} />
                    <Link
                      aria-label={`Review request #${req.id}`}
                      className="row-action"
                      to="/hr/requests"
                    >
                      <ArrowRight aria-hidden="true" size={17} />
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Recent HR Activity */}
          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Audit preview</p>
                <h2>Recent HR Activity</h2>
              </div>
              <Link className="text-link" to="/hr/audit-log">
                View audit log <ArrowRight size={16} />
              </Link>
            </div>

            <div className="panel" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'grid', gap: '14px' }}>
                {hrRecentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      borderBottom: '1px solid #edf1ef',
                      paddingBottom: '12px',
                    }}
                  >
                    <div
                      style={{
                        background: '#e8f3ef',
                        color: '#2d6a4f',
                        borderRadius: '6px',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <CheckCircle2 size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.84rem', color: '#1d2935' }}>{activity.title}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#8fa0aa' }}>{activity.timestamp}</span>
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#687789' }}>
                        {activity.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Quick Actions & Knowledge Base Status */}
        <div>
          {/* Quick Actions */}
          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Shortcuts</p>
                <h2>Quick Actions</h2>
              </div>
            </div>

            <div className="quick-action-list">
              <Link className="quick-action" to="/hr/requests">
                <div className="quick-action-icon">
                  <Clock size={16} />
                </div>
                <span>
                  <strong>Review Requests</strong>
                  <small>Evaluate pending leave and remote requests</small>
                </span>
                <ArrowRight size={16} />
              </Link>

              <Link className="quick-action" to="/hr/knowledge-base">
                <div className="quick-action-icon">
                  <BookOpen size={16} />
                </div>
                <span>
                  <strong>Manage Policies</strong>
                  <small>Upload, version, and organize documents</small>
                </span>
                <ArrowRight size={16} />
              </Link>

              <Link className="quick-action" to="/hr/analytics">
                <div className="quick-action-icon">
                  <LineChart size={16} />
                </div>
                <span>
                  <strong>View Analytics</strong>
                  <small>Monitor policy inquiries and resolution rates</small>
                </span>
                <ArrowRight size={16} />
              </Link>

              <Link className="quick-action" to="/hr/audit-log">
                <div className="quick-action-icon">
                  <FileText size={16} />
                </div>
                <span>
                  <strong>View Audit Log</strong>
                  <small>Review organizational compliance history</small>
                </span>
                <ArrowRight size={16} />
              </Link>

              <Link className="quick-action" to="/hr/users">
                <div className="quick-action-icon">
                  <Users size={16} />
                </div>
                <span>
                  <strong>Users & Roles</strong>
                  <small>Manage employees, roles, and status</small>
                </span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* Knowledge Base Status Card */}
          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">RAG Readiness</p>
                <h2>Knowledge Base Status</h2>
              </div>
            </div>

            <article className="panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <ShieldCheck size={20} style={{ color: '#27704d' }} />
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#1d2935' }}>
                    {activePoliciesCount} Active Documents Indexed
                  </strong>
                  <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#687789' }}>
                    Verified for Ask HR semantic retrieval
                  </p>
                </div>
              </div>

              <div style={{ background: '#f8faf9', border: '1px solid #edf1ef', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '6px' }}>
                  <span style={{ color: '#687789' }}>Active Policies:</span>
                  <strong>{activePoliciesCount} documents</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '6px' }}>
                  <span style={{ color: '#687789' }}>Archived Policies:</span>
                  <strong>1 document</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                  <span style={{ color: '#687789' }}>Last Synchronized:</span>
                  <strong>Today, 10 Sep 2026</strong>
                </div>
              </div>

              <Link
                className="secondary-button"
                style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}
                to="/hr/knowledge-base"
              >
                Open Knowledge Base
              </Link>
            </article>
          </section>
        </div>
      </div>
    </div>
  )
}

export default HRDashboard
