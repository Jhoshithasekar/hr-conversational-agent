import { useState } from 'react'
import {
  CheckCircle2,
  Edit2,
  Eye,
  Mail,
  X,
} from 'lucide-react'

import StatusBadge from '../../components/common/StatusBadge'
import FilterBar from '../../components/common/FilterBar'
import EmptyState from '../../components/common/EmptyState'
import { initialHrUsersList } from '../../data/hrMockData'

function HRUsers() {
  const [users, setUsers] = useState(initialHrUsersList)
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
    status: '',
    manager: '',
  })
  const [modalNotice, setModalNotice] = useState(null)

  const distinctDepts = Array.from(new Set(users.map((u) => u.department)))

  const roleTabs = [
    { label: 'All Roles', value: 'all' },
    { label: 'Employee', value: 'Employee' },
    { label: 'Manager', value: 'Manager' },
    { label: 'HR', value: 'HR' },
    { label: 'ICC', value: 'ICC' },
  ]

  const deptOptions = [
    { label: 'All Departments', value: 'all' },
    ...distinctDepts.map((d) => ({ label: d, value: d })),
  ]

  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Active', value: 'Active' },
    { label: 'On Leave', value: 'On Leave' },
  ]

  const filteredUsers = users.filter((u) => {
    if (deptFilter !== 'all' && u.department !== deptFilter) {
      return false
    }
    if (roleFilter !== 'all' && u.role !== roleFilter) {
      return false
    }
    if (statusFilter !== 'all' && u.status !== statusFilter) {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = u.name.toLowerCase().includes(q)
      const matchEmail = u.email.toLowerCase().includes(q)
      const matchDept = u.department.toLowerCase().includes(q)
      const matchRole = u.role.toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchDept && !matchRole) return false
    }
    return true
  })

  const handleOpenModal = (user, editMode = false) => {
    setSelectedUser(user)
    setIsEditing(editMode)
    setEditFormData({
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      status: user.status,
      manager: user.manager,
    })
    setModalNotice(null)
  }

  const handleCloseModal = () => {
    setSelectedUser(null)
    setIsEditing(false)
    setModalNotice(null)
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!selectedUser) return

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              ...editFormData,
            }
          : u
      )
    )

    setSelectedUser((prev) => ({
      ...prev,
      ...editFormData,
    }))

    setModalNotice({
      type: 'success',
      message: `User record for ${editFormData.name} updated successfully.`,
    })
    setIsEditing(false)
  }

  return (
    <div className="page-content">
      <div className="section-heading" style={{ marginBottom: '20px' }}>
        <div>
          <p className="eyebrow">Workforce Management</p>
          <h2>Users & Role Governance</h2>
        </div>
        <span className="section-note">
          {filteredUsers.length} employee{filteredUsers.length !== 1 ? 's' : ''} listed
        </span>
      </div>

      {/* Filter and Control Bar using FilterBar */}
      <FilterBar
        activeTab={roleFilter}
        onSearchChange={setSearchQuery}
        onSelectChange={setDeptFilter}
        onTabChange={setRoleFilter}
        searchPlaceholder="Search employees by name, email, or role..."
        searchValue={searchQuery}
        selectLabel="Filter by department"
        selectOptions={deptOptions}
        selectValue={deptFilter}
        tabs={roleTabs}
      >
        <div className="filter-select-wrap">
          <select
            aria-label="Filter by status"
            className="filter-select"
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          description="No users found matching your current filter criteria."
          icon="search"
          title="No users found"
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Work Email</th>
                <th>Department</th>
                <th style={{ width: '130px' }}>Assigned Role</th>
                <th style={{ width: '110px' }}>Status</th>
                <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar avatar-small">
                        {u.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.86rem', color: '#1d2935' }}>{u.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#8fa0aa' }}>
                          ID: EMP-00{u.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                      <Mail size={13} style={{ color: '#8fa0aa' }} />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: '#3b4b59' }}>{u.department}</span>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        background:
                          u.role === 'Manager'
                            ? '#e8f3ef'
                            : u.role === 'HR'
                            ? '#fef3e2'
                            : u.role === 'ICC'
                            ? '#f5e8f7'
                            : '#edf2f7',
                        color:
                          u.role === 'Manager'
                            ? '#2d6a4f'
                            : u.role === 'HR'
                            ? '#8a590c'
                            : u.role === 'ICC'
                            ? '#6b21a8'
                            : '#475569',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={u.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        className="secondary-button"
                        onClick={() => handleOpenModal(u, false)}
                        style={{ height: '32px', minHeight: '32px', padding: '0 10px', fontSize: '0.74rem' }}
                        title="View Details"
                        type="button"
                      >
                        <Eye size={13} style={{ marginRight: '4px' }} /> View
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => handleOpenModal(u, true)}
                        style={{ height: '32px', minHeight: '32px', padding: '0 10px', fontSize: '0.74rem' }}
                        title="Edit Role / Status"
                        type="button"
                      >
                        <Edit2 size={13} style={{ marginRight: '4px' }} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Details & Edit Modal */}
      {selectedUser && (
        <div className="modal-backdrop" onClick={handleCloseModal} role="dialog">
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '540px' }}
          >
            <button
              aria-label="Close modal"
              className="modal-close-btn"
              onClick={handleCloseModal}
              type="button"
            >
              <X size={18} />
            </button>

            <div style={{ borderBottom: '1px solid #edf1ef', paddingBottom: '14px', marginBottom: '18px' }}>
              <span className="eyebrow">
                {isEditing ? 'Governance Action' : 'Workforce Record'}
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', color: '#1d2935' }}>
                {isEditing ? `Edit User: ${selectedUser.name}` : selectedUser.name}
              </h3>
            </div>

            {modalNotice && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  background: '#e8f3ef',
                  border: '1px solid #c2e0d3',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.84rem',
                  color: '#2d6a4f',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{modalNotice.message}</span>
              </div>
            )}

            <div>
              {isEditing ? (
                <form onSubmit={handleSaveEdit} style={{ display: 'grid', gap: '14px' }}>
                  <div>
                    <label
                      htmlFor="user-role-select"
                      style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4a5b68', marginBottom: '6px' }}
                    >
                      Assigned Workspace Role
                    </label>
                    <select
                      className="filter-select"
                      id="user-role-select"
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      style={{ width: '100%', height: '40px' }}
                      value={editFormData.role}
                    >
                      <option value="Employee">Employee (Self-Service)</option>
                      <option value="Manager">Manager (Team Management + Self-Service)</option>
                      <option value="HR">HR (Human Resources Operations)</option>
                      <option value="ICC">ICC (Internal Complaints Committee)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="user-dept-select"
                      style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4a5b68', marginBottom: '6px' }}
                    >
                      Department
                    </label>
                    <select
                      className="filter-select"
                      id="user-dept-select"
                      onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                      style={{ width: '100%', height: '40px' }}
                      value={editFormData.department}
                    >
                      {distinctDepts.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="user-status-select"
                      style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4a5b68', marginBottom: '6px' }}
                    >
                      Account Status
                    </label>
                    <select
                      className="filter-select"
                      id="user-status-select"
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      style={{ width: '100%', height: '40px' }}
                      value={editFormData.status}
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="user-manager-input"
                      style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4a5b68', marginBottom: '6px' }}
                    >
                      Reporting Manager
                    </label>
                    <input
                      id="user-manager-input"
                      onChange={(e) => setEditFormData({ ...editFormData, manager: e.target.value })}
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 12px',
                        border: '1px solid #cfdad5',
                        borderRadius: '7px',
                        fontSize: '0.86rem',
                        boxSizing: 'border-box',
                      }}
                      type="text"
                      value={editFormData.manager}
                    />
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      className="secondary-button"
                      onClick={() => setIsEditing(false)}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button className="primary-button" type="submit">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'grid', gap: '14px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#d9e7f2',
                        color: '#1a3c5a',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {selectedUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#1d2935' }}>
                        {selectedUser.name}
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#687789' }}>
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '14px',
                      marginTop: '6px',
                    }}
                  >
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#687789' }}>
                        Department
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: '#1d2935' }}>
                        {selectedUser.department}
                      </strong>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#687789' }}>
                        Workspace Role
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: '#1d2935' }}>
                        {selectedUser.role}
                      </strong>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#687789' }}>
                        Reporting Manager
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: '#1d2935' }}>
                        {selectedUser.manager || 'None'}
                      </strong>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#687789' }}>
                        Joined Date
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: '#1d2935' }}>
                        {selectedUser.joinedDate || '15 Jan 2024'}
                      </strong>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      className="secondary-button"
                      onClick={handleCloseModal}
                      type="button"
                    >
                      Close
                    </button>
                    <button
                      className="primary-button"
                      onClick={() => setIsEditing(true)}
                      type="button"
                    >
                      <Edit2 size={15} style={{ marginRight: '6px' }} /> Edit User
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HRUsers
