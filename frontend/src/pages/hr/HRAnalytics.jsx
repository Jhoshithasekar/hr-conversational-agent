import {
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  MessageSquare,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import StatCard from '../../components/common/StatCard'
import { hrAnalyticsData } from '../../data/hrMockData'

function HRAnalytics() {
  const { summaryCards, requestsByType, mostAskedPolicies, knowledgeGaps } = hrAnalyticsData

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="section-heading" style={{ marginBottom: '20px' }}>
        <div>
          <p className="eyebrow">Intelligence & Insights</p>
          <h2>HR Analytics & Reports</h2>
        </div>
        <span className="section-note">Quarterly summary (Q3 2026)</span>
      </div>

      {/* Demo Data Notice */}
      <div
        style={{
          background: '#fdf7ea',
          border: '1px solid #f1e2be',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '0.78rem',
          color: '#825619',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
        }}
      >
        <Info size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>Operational Intelligence:</strong> Operational metrics for policy inquiries, decision velocity, and request distributions.
        </span>
      </div>

      {/* Summary Stat Cards using StatCard */}
      <section className="section-block">
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <StatCard
            footnote="Inquiries via Ask HR"
            icon={MessageSquare}
            label="Policy Queries"
            subtext="total queries"
            tone="teal"
            value={summaryCards.policyQuestions}
          />

          <StatCard
            footnote="Autonomous resolution rate: 93.5%"
            icon={CheckCircle2}
            label="Answered Queries"
            subtext="resolved"
            tone="teal"
            value={summaryCards.answeredQuestions}
          />

          <StatCard
            footnote="Flagged for knowledge base expansion"
            icon={HelpCircle}
            label="Knowledge Gaps"
            subtext="unanswered"
            tone="coral"
            value={summaryCards.unansweredQuestions}
          />

          <StatCard
            footnote="From submission to manager decision"
            icon={Clock}
            label="Avg. Decision Time"
            subtext="turnaround"
            tone="gold"
            value={summaryCards.avgDecisionTime}
          />
        </div>
      </section>

      {/* 3 Focused Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '10px' }}>
        {/* Card 1: Requests by Type */}
        <section className="section-block" style={{ margin: 0 }}>
          <div className="section-heading" style={{ marginBottom: '12px' }}>
            <div>
              <p className="eyebrow">Distribution</p>
              <h2>Requests by Type</h2>
            </div>
            <span className="section-note">{summaryCards.totalRequests} Total</span>
          </div>

          <div className="panel" style={{ padding: '20px', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'grid', gap: '16px' }}>
              {requestsByType.map((item) => (
                <div key={item.type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <strong>{item.type}</strong>
                    <span style={{ color: '#687789' }}>
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="progress-track" style={{ height: '7px' }}>
                    <span
                      style={{
                        width: `${item.percentage}%`,
                        background:
                          item.tone === 'coral'
                            ? '#c46b4f'
                            : item.tone === 'gold'
                            ? '#d19a4a'
                            : '#5c9a8f',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Card 2: Most Asked Policies */}
        <section className="section-block" style={{ margin: 0 }}>
          <div className="section-heading" style={{ marginBottom: '12px' }}>
            <div>
              <p className="eyebrow">Frequency</p>
              <h2>Most Queried Policies</h2>
            </div>
            <span className="section-note">Top inquiries</span>
          </div>

          <div className="panel" style={{ padding: '16px 20px', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'grid', gap: '12px' }}>
              {mostAskedPolicies.map((pol, idx) => (
                <div
                  key={pol.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: idx !== mostAskedPolicies.length - 1 ? '1px solid #edf1ef' : 0,
                    paddingBottom: idx !== mostAskedPolicies.length - 1 ? '10px' : 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        background: '#f8faf9',
                        border: '1px solid #dfe6e2',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#687789',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <strong style={{ fontSize: '0.84rem', color: '#1d2935' }}>{pol.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#87949d' }}>
                        {pol.queries} queries this quarter
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      background: '#e8f3ef',
                      color: '#2d6a4f',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {pol.resolutionRate} resolved
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Card 3: Knowledge Gaps & Suggested Actions */}
        <section className="section-block" style={{ margin: 0 }}>
          <div className="section-heading" style={{ marginBottom: '12px' }}>
            <div>
              <p className="eyebrow">Content Gaps</p>
              <h2>Knowledge Gaps</h2>
            </div>
            <Link className="text-link" to="/hr/knowledge-base">
              Manage policies
            </Link>
          </div>

          <div className="panel" style={{ padding: '16px 20px', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'grid', gap: '12px' }}>
              {knowledgeGaps.map((gap) => (
                <div
                  key={gap.topic}
                  style={{
                    background: '#fbfcfc',
                    border: '1px solid #dfe6e2',
                    borderRadius: '8px',
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: '0.82rem', color: '#1d2935' }}>{gap.topic}</strong>
                    <span
                      style={{
                        background: '#f8e4e1',
                        color: '#a34b43',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {gap.unansweredCount} gaps
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#687789', lineHeight: 1.4 }}>
                    Action: {gap.suggestedAction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HRAnalytics
