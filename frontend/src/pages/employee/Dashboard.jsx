import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  MessageCircle,
  ShieldAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'
import RequestCard from '../../components/common/RequestCard'
import StatCard from '../../components/common/StatCard'
import ProfileCard from '../../components/profile/ProfileCard'

import { fetchEmployee } from '../../api/employeeApi'
import { fetchDepartment } from '../../api/departmentApi'
import { fetchLeaveBalances } from '../../api/leaveBalanceApi'
import { fetchEmployeeRequests } from '../../api/requestApi'
import { useAuth } from '../../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()
  const employeeId = user?.employee_id
  const [employee, setEmployee] = useState(null)
  const [loadingEmployee, setLoadingEmployee] = useState(Boolean(employeeId))
  const [employeeError, setEmployeeError] = useState('')
  const [leaveBalances, setLeaveBalances] = useState([])
  const [loadingLeaveBalances, setLoadingLeaveBalances] = useState(Boolean(employeeId))
  const [leaveBalanceError, setLeaveBalanceError] = useState('')
  const [recentRequests, setRecentRequests] = useState([])
  const [requestState, setRequestState] = useState({ loading: Boolean(employeeId), error: '' })

  useEffect(() => {
    if (!employeeId) return

    let isCurrent = true

    async function loadEmployeeProfile() {
      try {
        setLoadingEmployee(true)
        setEmployeeError('')
        const employeeData = await fetchEmployee(employeeId)
        let departmentName = 'Not available'

        if (employeeData.department_id) {
          try {
            const departmentData = await fetchDepartment(employeeData.department_id)
            departmentName = departmentData.name
          } catch {
            departmentName = 'General'
          }
        }

        if (isCurrent) {
          setEmployee({ ...employeeData, departmentName })
        }
      } catch (error) {
        if (isCurrent) {
          setEmployeeError(error.message || 'Unable to load employee profile.')
        }
      } finally {
        if (isCurrent) {
          setLoadingEmployee(false)
        }
      }
    }

    loadEmployeeProfile()

    return () => {
      isCurrent = false
    }
  }, [employeeId])

  useEffect(() => {
    if (!employeeId) return

    let isCurrent = true

    async function loadRecentRequests() {
      try {
        setRequestState({ loading: true, error: '' })
        const requestData = await fetchEmployeeRequests(employeeId)
        if (isCurrent) {
          setRecentRequests(requestData.slice(0, 4))
          setRequestState({ loading: false, error: '' })
        }
      } catch (error) {
        if (isCurrent) {
          setRequestState({
            loading: false,
            error: error.message || 'Unable to load recent requests.',
          })
        }
      }
    }

    loadRecentRequests()

    return () => {
      isCurrent = false
    }
  }, [employeeId])

  useEffect(() => {
    if (!employeeId) return

    let isCurrent = true

    async function loadLeaveBalances() {
      try {
        setLoadingLeaveBalances(true)
        setLeaveBalanceError('')
        const balances = await fetchLeaveBalances(employeeId)
        if (isCurrent) {
          setLeaveBalances(balances)
        }
      } catch (error) {
        if (isCurrent) {
          setLeaveBalanceError(error.message || 'Unable to load leave balances.')
        }
      } finally {
        if (isCurrent) {
          setLoadingLeaveBalances(false)
        }
      }
    }

    loadLeaveBalances()

    return () => {
      isCurrent = false
    }
  }, [employeeId])

  return (
    <div className="page-content">
      {/* 1. Welcome / Profile Summary */}
      {loadingEmployee && <LoadingState message="Loading your employee profile..." />}
      {!loadingEmployee && employeeError && (
        <ErrorState message={employeeError} />
      )}
      {!loadingEmployee && !employeeError && employee && (
        <ProfileCard employee={employee} />
      )}

      {/* 2. Leave Balances Section */}
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Time off</p>
            <h2>Leave Balances</h2>
          </div>
          <span className="section-note">Fiscal Year 2026</span>
        </div>

        {loadingLeaveBalances && <LoadingState message="Fetching leave allocations..." />}
        {!loadingLeaveBalances && leaveBalanceError && (
          <ErrorState message={leaveBalanceError} />
        )}
        {!loadingLeaveBalances && !leaveBalanceError && leaveBalances.length === 0 && (
          <EmptyState
            description="No leave entitlement records found for the current fiscal period."
            icon="clock"
            title="No Leave Balances"
          />
        )}
        {!loadingLeaveBalances && !leaveBalanceError && leaveBalances.length > 0 && (
          <div className="stat-grid">
            {leaveBalances.map((balance, index) => (
              <StatCard
                key={balance.id || `${balance.leaveType}-${balance.year}`}
                label={`${balance.leaveType} Leave`}
                remaining={balance.remainingDays}
                tone={['teal', 'coral', 'gold'][index % 3]}
                total={balance.totalEntitlement}
                used={balance.usedDays}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Dashboard Grid: Recent Requests & Quick Actions */}
      <div className="dashboard-grid">
        {/* Left Column: Recent Requests */}
        <section className="section-block requests-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Activity</p>
              <h2>Recent Requests</h2>
            </div>
            <Link className="text-link" to="/employee/requests">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {requestState.loading && <LoadingState message="Loading requests..." />}
          {!requestState.loading && requestState.error && (
            <ErrorState message={requestState.error} />
          )}
          {!requestState.loading && !requestState.error && recentRequests.length === 0 && (
            <EmptyState
              description="You have not submitted any leave or reimbursement requests yet."
              icon="inbox"
              title="No Recent Requests"
            />
          )}
          {!requestState.loading && !requestState.error && recentRequests.length > 0 && (
            <div className="request-list">
              {recentRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Quick Actions */}
        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Self-service</p>
              <h2>Quick Actions</h2>
            </div>
          </div>

          <div className="quick-action-list">
            <Link className="quick-action" to="/employee/ask-hr">
              <div className="quick-action-icon">
                <MessageCircle size={18} />
              </div>
              <span>
                <strong>Ask HR Assistant</strong>
                <small>Ask questions on policies & leave</small>
              </span>
              <ArrowRight size={15} />
            </Link>

            <Link className="quick-action" to="/employee/requests">
              <div className="quick-action-icon">
                <ClipboardList size={18} />
              </div>
              <span>
                <strong>My Requests</strong>
                <small>Track submitted leaves & claims</small>
              </span>
              <ArrowRight size={15} />
            </Link>

            <Link className="quick-action" to="/employee/policies">
              <div className="quick-action-icon">
                <BookOpen size={18} />
              </div>
              <span>
                <strong>Company Policies</strong>
                <small>Review workplace guidelines</small>
              </span>
              <ArrowRight size={15} />
            </Link>

            <Link className="quick-action" to="/employee/report-concern">
              <div className="quick-action-icon" style={{ background: '#fdedec', color: '#c0392b' }}>
                <ShieldAlert size={18} />
              </div>
              <span>
                <strong>Report a Concern</strong>
                <small>Confidential grievance submission</small>
              </span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard