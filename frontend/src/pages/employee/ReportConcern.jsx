import { useState } from 'react'
import { LockKeyhole, Paperclip } from 'lucide-react'

import { EMPLOYEE_ID } from '../../api/employeeApi'
import { submitConcern } from '../../api/grievanceApi'

const initialForm = {
  reportType: 'named',
  respondentName: '',
  incidentDatePeriod: '',
  locationChannel: '',
  description: '',
  evidenceFile: null,
}

function ReportConcern() {
  const [form, setForm] = useState(initialForm)
  const [state, setState] = useState({ submitting: false, error: '', success: false })

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.respondentName.trim() || !form.incidentDatePeriod.trim()
      || !form.locationChannel.trim() || !form.description.trim()) {
      setState({
        submitting: false,
        error: 'Complete the respondent, incident period, location, and description fields.',
        success: false,
      })
      return
    }

    setState({ submitting: true, error: '', success: false })

    try {
      await submitConcern({
        complainant_id: form.reportType === 'anonymous' ? null : EMPLOYEE_ID,
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
        error: error.message || 'Unable to submit the confidential report.',
        success: false,
      })
    }
  }

  return (
    <div className="page-content narrow-content">
      <section className="confidential-banner">
        <LockKeyhole aria-hidden="true" size={21} />
        <div><strong>Confidential reporting channel</strong><p>Your report is intended for the appropriate ICC / POSH process only.</p></div>
      </section>
      <form className="panel concern-form" onSubmit={handleSubmit}>
        <div className="form-intro"><p className="eyebrow">Private and secure</p><h2>Share a workplace concern</h2><p>You can submit a named report or choose to remain anonymous. Your report is sent only to the POSH incident endpoint.</p></div>
        <div className="form-grid">
          <label>Report type<select onChange={(event) => updateField('reportType', event.target.value)} value={form.reportType}><option value="named">Named report</option><option value="anonymous">Anonymous report</option></select></label>
          <label>Respondent name<input onChange={(event) => updateField('respondentName', event.target.value)} placeholder="Enter a name" type="text" value={form.respondentName} /></label>
          <label>Incident date or period<input onChange={(event) => updateField('incidentDatePeriod', event.target.value)} placeholder="e.g. 12 Sep 2026 or Sep 2026" type="text" value={form.incidentDatePeriod} /></label>
          <label>Location or channel<input onChange={(event) => updateField('locationChannel', event.target.value)} placeholder="Office, call, email, or online" type="text" value={form.locationChannel} /></label>
        </div>
        <label>Description<textarea onChange={(event) => updateField('description', event.target.value)} placeholder="Describe what happened and any context that may help the review..." rows="6" value={form.description} /></label>
        <label className="attachment-field">Evidence attachment<span><Paperclip size={17} /> Attach a file<input onChange={(event) => updateField('evidenceFile', event.target.files[0] || null)} type="file" /></span></label>
        {state.error && <p className="state-message state-error" role="alert">{state.error}</p>}
        {state.success && <p className="state-message state-success" role="status">Your confidential report was submitted.</p>}
        <button className="primary-button" disabled={state.submitting} type="submit">
          {state.submitting ? 'Submitting...' : 'Submit confidential report'}
        </button>
      </form>
    </div>
  )
}

export default ReportConcern
