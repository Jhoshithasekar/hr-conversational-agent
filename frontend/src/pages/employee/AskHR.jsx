import { Send, ShieldCheck } from 'lucide-react'

function AskHR() {
  return (
    <div className="page-content narrow-content">
      <section className="chat-panel panel">
        <div className="chat-panel-header">
          <div>
            <p className="eyebrow">HR assistant</p>
            <h2>How can we help?</h2>
          </div>
          <span className="assistant-status"><span /> Available</span>
        </div>
        <div className="conversation" aria-label="Mock HR conversation">
          <div className="message user-message">
            <span className="message-label">You</span>
            <p>What is the sick leave policy?</p>
          </div>
          <div className="message assistant-message">
            <span className="message-label">HR Assistant</span>
            <p>Employees can use sick leave according to the applicable company leave policy.</p>
            <div className="source-row"><ShieldCheck size={15} /> Source: Leave Policy v3.2</div>
          </div>
        </div>
        <form className="chat-input-row" onSubmit={(event) => event.preventDefault()}>
          <label className="sr-only" htmlFor="hr-question">Ask your HR question</label>
          <input id="hr-question" placeholder="Ask a policy or workplace question..." type="text" />
          <button aria-label="Send question" className="primary-button send-button" type="submit"><Send size={17} /></button>
        </form>
      </section>
    </div>
  )
}

export default AskHR
