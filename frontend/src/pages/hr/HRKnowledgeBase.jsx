import { useState } from 'react'
import {
  Archive,
  BookOpen,
  Eye,
  Plus,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react'

import StatusBadge from '../../components/common/StatusBadge'
import FilterBar from '../../components/common/FilterBar'
import EmptyState from '../../components/common/EmptyState'
import { prototypeDocuments } from '../../data/hrMockData'

function HRKnowledgeBase() {
  const [documents, setDocuments] = useState(prototypeDocuments)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'active', 'archived'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // State for Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [newDoc, setNewDoc] = useState({
    name: '',
    category: 'Leave & Attendance',
    version: 'v1.0',
    targetAudience: 'All Employees',
    summary: '',
  })
  const [uploadFile, setUploadFile] = useState(null)

  // State for Document View Modal
  const [viewDoc, setViewDoc] = useState(null)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleToggleArchive = (docId) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              status: doc.status === 'Active' ? 'Archived' : 'Active',
              updatedDate: 'Today',
            }
          : doc
      )
    )
    if (viewDoc && viewDoc.id === docId) {
      setViewDoc((prev) => ({
        ...prev,
        status: prev.status === 'Active' ? 'Archived' : 'Active',
      }))
    }
  }

  const handleUploadSubmit = (e) => {
    e.preventDefault()
    if (!newDoc.name.trim()) return

    const createdDoc = {
      id: `doc-${Date.now()}`,
      name: newDoc.name.trim(),
      category: newDoc.category,
      version: newDoc.version.trim() || 'v1.0',
      status: 'Active',
      updatedDate: 'Today',
      uploadedBy: 'HR Administrator',
      fileSize: uploadFile ? `${(uploadFile.size / 1024 / 1024).toFixed(1)} MB` : '1.2 MB',
      summary: newDoc.summary.trim() || 'Uploaded policy document ready for vectorization.',
      effectiveDate: new Date().toLocaleDateString(),
      targetAudience: newDoc.targetAudience,
    }

    setDocuments([createdDoc, ...documents])
    setShowUploadModal(false)
    setNewDoc({
      name: '',
      category: 'Leave & Attendance',
      version: 'v1.0',
      targetAudience: 'All Employees',
      summary: '',
    })
    setUploadFile(null)
  }

  const categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Leave & Attendance', value: 'Leave & Attendance' },
    { label: 'Remote Work', value: 'Remote Work' },
    { label: 'Finance & Expenses', value: 'Finance & Expenses' },
    { label: 'Governance & Conduct', value: 'Governance & Conduct' },
    { label: 'Compensation & Benefits', value: 'Compensation & Benefits' },
  ]

  const statusTabs = [
    { label: 'All Documents', value: 'all', count: documents.length },
    { label: 'Active', value: 'active', count: documents.filter((d) => d.status === 'Active').length },
    { label: 'Archived', value: 'archived', count: documents.filter((d) => d.status === 'Archived').length },
  ]

  const filteredDocs = documents.filter((doc) => {
    if (activeTab === 'active' && doc.status !== 'Active') return false
    if (activeTab === 'archived' && doc.status !== 'Archived') return false
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = doc.name.toLowerCase().includes(q)
      const matchCategory = doc.category.toLowerCase().includes(q)
      const matchSummary = doc.summary.toLowerCase().includes(q)
      if (!matchName && !matchCategory && !matchSummary) return false
    }
    return true
  })

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="section-heading" style={{ marginBottom: '20px' }}>
        <div>
          <p className="eyebrow">Enterprise Knowledge</p>
          <h2>Knowledge Base & Policies</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="primary-button"
            onClick={() => setShowUploadModal(true)}
            type="button"
          >
            <Plus size={16} style={{ marginRight: '6px' }} />
            Upload Document
          </button>
        </div>
      </div>

      {/* RAG Readiness Banner */}
      <section
        style={{
          background: '#f8faf9',
          border: '1px solid #dfe6e2',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <div
          style={{
            background: '#e8f3ef',
            color: '#2d6a4f',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ShieldCheck size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: '0.88rem', color: '#1d2935' }}>
            RAG Document Management
          </strong>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#687789' }}>
            Active policies are maintained in this canonical repository for conversational retrieval by Ask HR. Documents marked as Archived are excluded from real-time agent answering.
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#687789' }}>
          <span><strong>{documents.filter((d) => d.status === 'Active').length} Active</strong></span> •{' '}
          <span>{documents.filter((d) => d.status === 'Archived').length} Archived</span>
        </div>
      </section>

      {/* Toolbar & Filters using FilterBar */}
      <FilterBar
        activeTab={activeTab}
        onSearchChange={setSearchQuery}
        onSelectChange={setCategoryFilter}
        onTabChange={handleTabChange}
        searchPlaceholder="Search documents by name, category, or summary..."
        searchValue={searchQuery}
        selectLabel="Filter by category"
        selectOptions={categories}
        selectValue={categoryFilter}
        tabs={statusTabs}
      />

      {/* Documents Table */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          description="Try adjusting your search query or switching between active and archived tabs."
          icon="file"
          title="No matching documents found"
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Version</th>
                <th>Status</th>
                <th>Updated Date</th>
                <th>Uploaded By</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => {
                const isArchived = doc.status === 'Archived'

                return (
                  <tr
                    key={doc.id}
                    style={{
                      opacity: isArchived ? 0.72 : 1,
                      background: isArchived ? '#fbfcfc' : 'transparent',
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            background: isArchived ? '#edf1ef' : '#f7e8e1',
                            color: isArchived ? '#687789' : '#a5563f',
                            borderRadius: '8px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <strong>{doc.name}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#87949d' }}>
                            {doc.fileSize} • {doc.targetAudience}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#52626d' }}>{doc.category}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          background: '#edf1ef',
                          borderRadius: '4px',
                          padding: '3px 7px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: '#1d2935',
                        }}
                      >
                        {doc.version}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={doc.status} />
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#687789' }}>
                      {doc.updatedDate}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#52626d' }}>
                      {doc.uploadedBy}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          aria-label={`View ${doc.name}`}
                          className="secondary-button"
                          onClick={() => setViewDoc(doc)}
                          style={{ height: '32px', minHeight: '32px', padding: '0 10px', fontSize: '0.74rem' }}
                          title="View Details"
                          type="button"
                        >
                          <Eye size={14} style={{ marginRight: '4px' }} />
                          Details
                        </button>
                        <button
                          aria-label={isArchived ? 'Activate' : 'Archive'}
                          className="secondary-button"
                          onClick={() => handleToggleArchive(doc.id)}
                          style={{
                            height: '32px',
                            minHeight: '32px',
                            padding: '0 10px',
                            fontSize: '0.74rem',
                            color: isArchived ? '#27704d' : '#8fa0aa',
                          }}
                          title={isArchived ? 'Restore to Active' : 'Move to Archive'}
                          type="button"
                        >
                          <Archive size={14} style={{ marginRight: '4px' }} />
                          {isArchived ? 'Restore' : 'Archive'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Document Details Modal */}
      {viewDoc && (
        <div className="modal-backdrop" role="dialog">
          <div className="modal-container">
            <button
              aria-label="Close modal"
              className="modal-close-btn"
              onClick={() => setViewDoc(null)}
              type="button"
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #edf1ef', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <span className="eyebrow">Knowledge Asset Metadata</span>
                <h2 style={{ margin: '4px 0 0', fontFamily: 'Manrope, sans-serif' }}>{viewDoc.name}</h2>
              </div>
              <StatusBadge status={viewDoc.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '18px' }}>
              <div style={{ background: '#f8faf9', padding: '10px 14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 700 }}>Category</span>
                <strong style={{ display: 'block', marginTop: '2px', fontSize: '0.86rem' }}>{viewDoc.category}</strong>
              </div>
              <div style={{ background: '#f8faf9', padding: '10px 14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 700 }}>Version</span>
                <strong style={{ display: 'block', marginTop: '2px', fontSize: '0.86rem' }}>{viewDoc.version}</strong>
              </div>
              <div style={{ background: '#f8faf9', padding: '10px 14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 700 }}>Effective Date</span>
                <strong style={{ display: 'block', marginTop: '2px', fontSize: '0.86rem' }}>{viewDoc.effectiveDate || viewDoc.updatedDate}</strong>
              </div>
              <div style={{ background: '#f8faf9', padding: '10px 14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 700 }}>Target Audience</span>
                <strong style={{ display: 'block', marginTop: '2px', fontSize: '0.86rem' }}>{viewDoc.targetAudience}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.72rem', color: '#8fa0aa', textTransform: 'uppercase', fontWeight: 700 }}>Summary & Scope</span>
              <p style={{ background: '#fff', border: '1px solid #dfe6e2', borderRadius: '8px', padding: '12px 14px', margin: '6px 0 0', fontSize: '0.84rem', lineHeight: '1.5' }}>
                {viewDoc.summary}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #edf1ef', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#8fa0aa' }}>
                File: {viewDoc.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf ({viewDoc.fileSize})
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="secondary-button"
                  onClick={() => handleToggleArchive(viewDoc.id)}
                  type="button"
                >
                  {viewDoc.status === 'Active' ? 'Archive Policy' : 'Restore Policy'}
                </button>
                <button
                  className="primary-button"
                  onClick={() => setViewDoc(null)}
                  type="button"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="modal-backdrop" role="dialog">
          <div className="modal-container">
            <button
              aria-label="Close modal"
              className="modal-close-btn"
              onClick={() => setShowUploadModal(false)}
              type="button"
            >
              <X size={20} />
            </button>

            <div style={{ borderBottom: '1px solid #edf1ef', paddingBottom: '14px', marginBottom: '18px' }}>
              <span className="eyebrow">Document Repository</span>
              <h2 style={{ margin: '4px 0 0', fontFamily: 'Manrope, sans-serif' }}>Upload Policy Document</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#687789' }}>
                Upload a company policy document for organization-wide distribution and future AI assistant retrieval.
              </p>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div style={{ display: 'grid', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#52626d', marginBottom: '5px' }}>
                    Document Title *
                  </label>
                  <input
                    onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                    placeholder="e.g. Parental Leave Policy v2.0"
                    required
                    style={{ width: '100%', height: '40px', border: '1px solid #cfdad5', borderRadius: '7px', padding: '0 12px', boxSizing: 'border-box' }}
                    type="text"
                    value={newDoc.name}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#52626d', marginBottom: '5px' }}>
                      Category *
                    </label>
                    <select
                      onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                      style={{ width: '100%', height: '40px', border: '1px solid #cfdad5', borderRadius: '7px', padding: '0 10px', boxSizing: 'border-box' }}
                      value={newDoc.category}
                    >
                      <option value="Leave & Attendance">Leave & Attendance</option>
                      <option value="Remote Work">Remote Work</option>
                      <option value="Finance & Expenses">Finance & Expenses</option>
                      <option value="Governance & Conduct">Governance & Conduct</option>
                      <option value="Compensation & Benefits">Compensation & Benefits</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#52626d', marginBottom: '5px' }}>
                      Version
                    </label>
                    <input
                      onChange={(e) => setNewDoc({ ...newDoc, version: e.target.value })}
                      placeholder="e.g. v1.0"
                      style={{ width: '100%', height: '40px', border: '1px solid #cfdad5', borderRadius: '7px', padding: '0 12px', boxSizing: 'border-box' }}
                      type="text"
                      value={newDoc.version}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#52626d', marginBottom: '5px' }}>
                    Target Audience
                  </label>
                  <input
                    onChange={(e) => setNewDoc({ ...newDoc, targetAudience: e.target.value })}
                    placeholder="e.g. All Full-Time Employees"
                    style={{ width: '100%', height: '40px', border: '1px solid #cfdad5', borderRadius: '7px', padding: '0 12px', boxSizing: 'border-box' }}
                    type="text"
                    value={newDoc.targetAudience}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#52626d', marginBottom: '5px' }}>
                    Summary / Scope
                  </label>
                  <textarea
                    onChange={(e) => setNewDoc({ ...newDoc, summary: e.target.value })}
                    placeholder="Briefly describe what this policy covers..."
                    rows={3}
                    style={{ width: '100%', border: '1px solid #cfdad5', borderRadius: '7px', padding: '8px 12px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    value={newDoc.summary}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#52626d', marginBottom: '5px' }}>
                    Document File (PDF / DOCX)
                  </label>
                  <div
                    style={{
                      border: '1px dashed #cfdad5',
                      borderRadius: '8px',
                      padding: '16px',
                      textAlign: 'center',
                      background: '#f8faf9',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      id="policy-file-upload"
                      onChange={(e) => setUploadFile(e.target.files[0] || null)}
                      style={{ display: 'none' }}
                      type="file"
                    />
                    <label htmlFor="policy-file-upload" style={{ cursor: 'pointer' }}>
                      <Upload size={24} style={{ color: '#a5563f', margin: '0 auto 6px', display: 'block' }} />
                      <strong style={{ fontSize: '0.82rem', color: '#1d2935' }}>
                        {uploadFile ? uploadFile.name : 'Click to select a file'}
                      </strong>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#8fa0aa', marginTop: '2px' }}>
                        {uploadFile ? `${(uploadFile.size / 1024).toFixed(1)} KB selected` : 'PDF, DOCX up to 25MB'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #edf1ef', paddingTop: '16px' }}>
                <button
                  className="secondary-button"
                  onClick={() => setShowUploadModal(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  Upload Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HRKnowledgeBase
