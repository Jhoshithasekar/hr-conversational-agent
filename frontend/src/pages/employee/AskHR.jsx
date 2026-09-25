import { useState } from 'react'
import {
  Bot,
  Send,
  ShieldCheck,
} from 'lucide-react'

const initialMessages = [
  {
    id: 1,
    sender: 'assistant',
    text: 'Hello! I am your PeopleDesk HR Assistant. You can ask me questions about company policies, leave entitlements, work-from-home rules, and expense guidelines.',
    source: null,
    timestamp: '09:00 AM',
  },
  {
    id: 2,
    sender: 'user',
    text: 'What is the sick leave policy for consecutive days?',
    source: null,
    timestamp: '09:02 AM',
  },
  {
    id: 3,
    sender: 'assistant',
    text: 'Under Leave Policy v3.2 (Section 4.2), employees may avail sick leave for up to 12 days per year. If sick leave extends beyond 2 consecutive days, a registered medical practitioner certificate is required upon resuming work.',
    source: 'Leave Policy v3.2 · Section 4.2',
    timestamp: '09:02 AM',
  },
]

const suggestedPrompts = [
  'How do I apply for annual leave?',
  'What is the standard WFH allowance?',
  'How do reimbursement claims get approved?',
  'Where can I review the Code of Conduct?',
]

function AskHR() {
  const [messages, setMessages] = useState(initialMessages)
  const [inputText, setInputText] = useState('')

  const handleSend = (textToSend) => {
    const query = (textToSend || inputText).trim()
    if (!query) return

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: 'user',
        text: query,
        source: null,
        timestamp: 'Just now',
      },
      {
        id: prev.length + 2,
        sender: 'assistant',
        text: `Regarding your query "${query}": Please refer to the PeopleDesk policy repository or submit an inquiry to your HR representative for official evaluation.`,
        source: 'Corporate HR Policy Manual 2026',
        timestamp: 'Just now',
      },
    ])
    setInputText('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <div className="page-content narrow-content">
      <section className="chat-panel panel">
        {/* Header */}
        <div className="chat-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#f7e8e1',
                color: '#a5563f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>HR Assistant</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#687789' }}>
                Instant answers from company policies
              </p>
            </div>
          </div>
          <span className="assistant-status">
            <span /> Available
          </span>
        </div>

        {/* Suggested Prompt Chips */}
        <div style={{ padding: '14px 0 6px', borderBottom: '1px solid #edf1ef' }}>
          <span style={{ fontSize: '0.72rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            Frequently Asked
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                style={{
                  background: '#f4f7f6',
                  border: '1px solid #dfe6e2',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  color: '#243240',
                  cursor: 'pointer',
                  transition: 'background 140ms ease',
                }}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Stream */}
        <div
          className="conversation"
          aria-label="HR conversation stream"
          style={{ minHeight: '320px', maxHeight: '480px', overflowY: 'auto' }}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user'
            return (
              <div
                className={`message ${isUser ? 'user-message' : 'assistant-message'}`}
                key={msg.id}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="message-label" style={{ margin: 0 }}>
                    {isUser ? 'You' : 'HR Assistant'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#8fa0aa' }}>{msg.timestamp}</span>
                </div>
                <p>{msg.text}</p>
                {msg.source && (
                  <div className="source-row">
                    <ShieldCheck size={14} style={{ color: '#059669' }} />
                    <span>Source: {msg.source}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Chat Input */}
        <form className="chat-input-row" onSubmit={handleSubmit} style={{ marginTop: '12px' }}>
          <label className="sr-only" htmlFor="hr-question">
            Ask your HR question
          </label>
          <input
            id="hr-question"
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about leave entitlements, expenses, or policies..."
            type="text"
            value={inputText}
          />
          <button aria-label="Send question" className="primary-button send-button" type="submit">
            <Send size={16} />
          </button>
        </form>
      </section>
    </div>
  )
}

export default AskHR
