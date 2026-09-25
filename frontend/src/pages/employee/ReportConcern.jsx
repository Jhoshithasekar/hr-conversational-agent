import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  LockKeyhole,
  Paperclip,
  ShieldCheck,
  Trash2,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { submitConcern } from '../../api/grievanceApi'
import ErrorState from '../../components/common/ErrorState'

const initialForm = {
  reportType: 'named',
  respondentName: '',
  incidentDatePeriod: '',
  locationChannel: '',
  description: '',
  evidenceFile: null,
}

function ReportConcern() {
  const { user } = useAuth()
  const employeeId = user?.employee_id
  const [form, setForm] = useState(initialForm)
  const [state, setState] = useState({ submitting: false, error: '', success: false })

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (
      !form.respondentName.trim() ||
      !form.incidentDatePeriod.trim() ||
      !form.locationChannel.trim() ||
      !form.description.trim()
    ) {
      setState({
        submitting: false,
        error: 'Please complete all required fields: respondent name, incident date/period, location/channel, and description.',
        success: false,
      })
      return
    }

    setState({ submitting: true, error: '', success: false })

    try {
      await submitConcern({
        complainant_id: form.reportType === 'anonymous' ? null : (employeeId || null),
        is_anonymous: form.reportType === 'anonymous',
        respondent_name: form.respondentName.trim(),
        incident_date_period: form.incidentDatePeriod.trim(),
        location_channel: form.locationChannel.trim(),
        description: form.description.trim(),
        evidence_files: form.evidenceFile?.name || null,
        icc_case_officer_id: null,
        case_status: 'Submitted',
      })
      setForm(initialForm)
      setState({ submitting: false, error: '', success: true })
    } catch (error) {
      setState({
        submitting: false,
        error: error.message || 'Unable to submit the confidential report. Please try again.',
        success: false,
      })
    }
  }

  function handleReset() {
    setForm(initialForm)
    setState({ submitting: false, error: '', success: false })
  }

  return (
    <div className="page-content narrow-content">
      {/* Statutory POSH Banner */}
      <section className="confidential-banner" style={{ marginBottom: '20px' }}>
        <ShieldCheck aria-hidden="true" size={24} style={{ color: '#a5563f', flexShrink: 0 }} />
        <div>
          <strong>Strict Confidentiality Guarantee (POSH Act, 2013)</strong>
          <p>
            All submissions through this channel are routed directly and exclusively to the Internal Complaints
            Committee (ICC). Your identity and details are protected under legal confidentiality provisions and
            anti-retaliation policies.
          </p>
        </div>
      </section>

      {state.success ? (
        <section className="panel" style={{ textAlign: 'center', padding: '40px 28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#e8f3ef',
              color: '#2d6a4f',
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px', color: '#1d2935' }}>
            Confidential Report Submitted
          </h2>
          <p style={{ color: '#687789', fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto 24px', lineHeight: 1.55 }}>
            Your report has been securely registered with the Internal Complaints Committee (ICC). The committee will
            initiate preliminary review in accordance with POSH statutory guidelines.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="primary-button" onClick={handleReset} type="button">
              Submit Another Report
            </button>
            <Link className="secondary-button" to="/employee">
              <ArrowLeft size={15} style={{ marginRight: '6px' }} />
              Return to Dashboard
            </Link>
          </div>
        </section>
      ) : (
        <form className="panel concern-form" onSubmit={handleSubmit}>
          <div className="form-intro" style={{ borderBottom: '1px solid #eef2f0', paddingBottom: '16px' }}>
            <p className="eyebrow" style={{ color: '#a5563f' }}>Private & Secure</p>
            <h2 style={{ margin: '4px 0 8px', fontSize: '1.25rem' }}>Report a Workplace Concern</h2>
            <p style={{ margin: 0 }}>
              Use this form to confidentially report incidents of harassment, misconduct, or ethical violations.
            </p>
          </div>

          {/* Section 1: Reporting Identity */}
          <div style={{ display: 'grid', gap: '10px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
              Reporting Identity
              <select
                onChange={(event) => updateField('reportType', event.target.value)}
                style={{ width: '100%', marginTop: '6px' }}
                value={form.reportType}
              >
                <option value="named">Named Report (Confidential to ICC Presiding Officer)</option>
                <option value="anonymous">Anonymous Report (Complainant Identity Withheld)</option>
              </select>
            </label>
            <p style={{ fontSize: '0.78rem', color: '#687789', margin: 0, lineHeight: 1.4 }}>
              {form.reportType === 'anonymous'
                ? 'ℹ️ Anonymous reports do not record your employee ID or name. Please provide sufficient detail, as ICC members cannot reach out directly for clarifications.'
                : '🔒 In named reports, your identity is strictly restricted to ICC members and is not disclosed to respondents or team managers.'}
            </p>
          </div>

          {/* Section 2: Incident Particulars */}
          <div className="form-grid">
            <label>
              Respondent Name <span style={{ color: '#b91c1c' }}>*</span>
              <input
                onChange={(event) => updateField('respondentName', event.target.value)}
                placeholder="Individual or parties involved"
                required
                type="text"
                value={form.respondentName}
              />
            </label>
            <label>
              Incident Date or Period <span style={{ color: '#b91c1c' }}>*</span>
              <input
                onChange={(event) => updateField('incidentDatePeriod', event.target.value)}
                placeholder="e.g. 12 Sep 2026 or Early Sep 2026"
                required
                type="text"
                value={form.incidentDatePeriod}
              />
            </label>
          </div>

          <label>
            Location or Communication Channel <span style={{ color: '#b91c1c' }}>*</span>
            <input
              onChange={(event) => updateField('locationChannel', event.target.value)}
              placeholder="e.g. Floor 3 Conference Room, Slack, Zoom, or Offsite Event"
              required
              type="text"
              value={form.locationChannel}
            />
          </label>

          {/* Section 3: Description */}
          <label>
            Incident Description & Context <span style={{ color: '#b91c1c' }}>*</span>
            <textarea
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Describe what occurred, any witnesses present, and relevant sequence of events..."
              required
              rows={6}
              value={form.description}
            />
          </label>

          {/* Section 4: Evidence Attachment */}
          <div style={{ display: 'grid', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#52626d' }}>
              Supporting Evidence or Documents (Optional)
            </span>
            {form.evidenceFile ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8faf9',
                  border: '1px solid #d8e2dc',
                  borderRadius: '7px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <FileText size={18} style={{ color: '#a5563f', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 500, color: '#1d2935', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {form.evidenceFile.name}
                  </span>
                </div>
                <button
                  className="icon-button"
                  onClick={() => updateField('evidenceFile', null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8899a6', padding: '4px' }}
                  title="Remove attachment"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="attachment-field" style={{ margin: 0, cursor: 'pointer' }}>
                <span>
                  <Paperclip size={17} /> Attach document, screenshot, or email export
                  <input
                    onChange={(event) => updateField('evidenceFile', event.target.files[0] || null)}
                    type="file"
                  />
                </span>
              </label>
            )}
          </div>

          {state.error && (
            <ErrorState
              message={state.error}
              onRetry={() => setState((s) => ({ ...s, error: '' }))}
              retryLabel="Dismiss"
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '8px' }}>
            <button className="primary-button" disabled={state.submitting} type="submit">
              {state.submitting ? (
                <>
                  <LockKeyhole size={15} style={{ marginRight: '6px' }} />
                  Submitting Encrypted Report...
                </>
              ) : (
                <>
                  <LockKeyhole size={15} style={{ marginRight: '6px' }} />
                  Submit Confidential Report
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ReportConcern
