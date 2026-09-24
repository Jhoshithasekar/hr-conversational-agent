import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

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
  const [loadingEmployee, setLoadingEmployee] = useState(true)
  const [employeeError, setEmployeeError] = useState('')
  const [leaveBalances, setLeaveBalances] = useState([])
  const [loadingLeaveBalances, setLoadingLeaveBalances] = useState(true)
  const [leaveBalanceError, setLeaveBalanceError] = useState('')
  const [recentRequests, setRecentRequests] = useState([])
  const [requestState, setRequestState] = useState({ loading: true, error: '' })

  useEffect(() => {
    if (!employeeId) {
      setEmployee(null)
      setLoadingEmployee(false)
      setEmployeeError('')
      return
    }

    async function loadEmployeeProfile() {
      try {
        setLoadingEmployee(true)
        setEmployeeError('')

        const employeeData = await fetchEmployee(employeeId)

        let departmentName = 'Not available'

        if (employeeData.department_id) {
          const departmentData = await fetchDepartment(
            employeeData.department_id
          )

          departmentName = departmentData.name
        }

        setEmployee({
          ...employeeData,
          departmentName,
        })
      } catch (error) {
        setEmployeeError(
          error.message ||
            'Unable to load employee profile.'
        )
      } finally {
        setLoadingEmployee(false)
      }
    }

    loadEmployeeProfile()
  }, [employeeId])

  useEffect(() => {
    if (!employeeId) {
      setRecentRequests([])
      setRequestState({ loading: false, error: '' })
      return
    }

    async function loadRecentRequests() {
      try {
        setRequestState({ loading: true, error: '' })
        const requestData = await fetchEmployeeRequests(employeeId)
        setRecentRequests(requestData.slice(0, 3))
        setRequestState({ loading: false, error: '' })
      } catch (error) {
        setRequestState({
          loading: false,
          error: error.message || 'Unable to load recent requests.',
        })
      }
    }

    loadRecentRequests()
  }, [employeeId])

  useEffect(() => {
    if (!employeeId) {
      setLeaveBalances([])
      setLoadingLeaveBalances(false)
      setLeaveBalanceError('')
      return
    }

    async function loadLeaveBalances() {
      try {
        setLoadingLeaveBalances(true)
        setLeaveBalanceError('')
        const balances = await fetchLeaveBalances(employeeId)
        setLeaveBalances(balances)
      } catch (error) {
        setLeaveBalanceError(
          error.message || 'Unable to load leave balances.'
        )
      } finally {
        setLoadingLeaveBalances(false)
      }
    }

    loadLeaveBalances()
  }, [employeeId])

  return (
    <div className="page-content">
      {loadingEmployee && (
        <section className="profile-card">
          <div className="profile-identity">
            <span className="eyebrow">
              Employee profile
            </span>

            <h2>Loading profile...</h2>

            <p>
              Please wait while we load your profile.
            </p>
          </div>
        </section>
      )}

      {!loadingEmployee && employeeError && (
        <section className="profile-card">
          <div className="profile-identity">
            <span className="eyebrow">
              Employee profile
            </span>

            <h2>Unable to load profile</h2>

            <p>{employeeError}</p>
          </div>
        </section>
      )}

      {!loadingEmployee &&
        !employeeError &&
        employee && (
          <ProfileCard employee={employee} />
        )}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Time off</p>
            <h2>Leave balances</h2>
          </div>

          <span className="section-note">
            Updated today
          </span>
        </div>

        <div className="stat-grid">
          {loadingLeaveBalances && (
            <p className="state-message">Loading leave balances...</p>
          )}

          {!loadingLeaveBalances && leaveBalanceError && (
            <p className="state-message state-error" role="alert">
              {leaveBalanceError}
            </p>
          )}

          {!loadingLeaveBalances && !leaveBalanceError && leaveBalances.length === 0 && (
            <p className="state-message">No leave balances found for 2026.</p>
          )}

          {!loadingLeaveBalances && !leaveBalanceError && leaveBalances.map((balance, index) => (
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
      </section>

      <section className="section-block requests-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Activity</p>
            <h2>Recent requests</h2>
          </div>

          <Link
            className="text-link"
            to="/employee/requests"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="request-list">
          {requestState.loading && (
            <p className="state-message">Loading requests...</p>
          )}
          {!requestState.loading && requestState.error && (
            <p className="state-message state-error" role="alert">
              {requestState.error}
            </p>
          )}
          {!requestState.loading && !requestState.error && recentRequests.length === 0 && (
            <p className="state-message">No recent requests found.</p>
          )}
          {!requestState.loading && !requestState.error && recentRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Dashboard