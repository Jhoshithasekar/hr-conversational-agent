import { LockKeyhole, Paperclip } from 'lucide-react'

function ReportConcern() {
  return (
    <div className="page-content narrow-content">
      <section className="confidential-banner">
        <LockKeyhole aria-hidden="true" size={21} />
        <div><strong>Confidential reporting channel</strong><p>Your report is intended for the appropriate ICC / POSH process only.</p></div>
      </section>
      <form className="panel concern-form" onSubmit={(event) => event.preventDefault()}>
        <div className="form-intro"><p className="eyebrow">Private and secure</p><h2>Share a workplace concern</h2><p>You can submit a named report or choose to remain anonymous. This interface is a mockup and does not send or store information yet.</p></div>
        <div className="form-grid">
          <label>Report type<select defaultValue="named"><option value="named">Named report</option><option value="anonymous">Anonymous report</option></select></label>
          <label>Respondent name<input placeholder="Enter a name" type="text" /></label>
          <label>Incident date or period<input type="text" placeholder="e.g. 12 Sep 2026 or Sep 2026" /></label>
          <label>Location or channel<input placeholder="Office, call, email, or online" type="text" /></label>
        </div>
        <label>Description<textarea placeholder="Describe what happened and any context that may help the review..." rows="6" /></label>
        <label className="attachment-field">Evidence attachment<span><Paperclip size={17} /> Attach a file<input type="file" /></span></label>
        <button className="primary-button" type="submit">Submit confidential report</button>
      </form>
    </div>
  )
}

export default ReportConcern
