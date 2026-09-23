import RequestCard from '../../components/common/RequestCard'
import { recentRequests } from '../../data/mockData'

function MyRequests() {
  return (
    <div className="page-content narrow-content">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Request history</p>
            <h2>Your recent requests</h2>
          </div>
          <span className="section-note">2 total</span>
        </div>
        <div className="request-list request-list-expanded">
          {recentRequests.map((request) => <RequestCard key={`${request.type}-${request.date}`} request={request} />)}
        </div>
      </section>
    </div>
  )
}

export default MyRequests
