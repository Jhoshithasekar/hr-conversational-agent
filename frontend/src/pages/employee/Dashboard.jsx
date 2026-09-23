import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import RequestCard from '../../components/common/RequestCard'
import StatCard from '../../components/common/StatCard'
import ProfileCard from '../../components/profile/ProfileCard'
import { employee, leaveBalances, recentRequests } from '../../data/mockData'

function Dashboard() {
  return (
    <div className="page-content">
      <ProfileCard employee={employee} />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Time off</p>
            <h2>Leave balances</h2>
          </div>
          <span className="section-note">Updated today</span>
        </div>
        <div className="stat-grid">
          {leaveBalances.map((balance, index) => (
            <StatCard
              key={balance.leaveType}
              label={`${balance.leaveType} Leave`}
              remaining={balance.remainingDays}
              tone={['teal', 'coral', 'gold'][index]}
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
            <Link className="text-link" to="/employee/requests">View all <ArrowRight size={16} /></Link>
          </div>
          <div className="request-list">
            {recentRequests.map((request) => <RequestCard key={`${request.type}-${request.date}`} request={request} />)}
          </div>
      </section>
    </div>
  )
}

export default Dashboard
