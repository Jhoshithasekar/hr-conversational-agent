import { BookOpen, Search } from 'lucide-react'

import StatusBadge from '../../components/common/StatusBadge'
import { policies } from '../../data/mockData'

function Policies() {
  return (
    <div className="page-content">
      <div className="policy-toolbar">
        <label className="search-field">
          <Search aria-hidden="true" size={17} />
          <span className="sr-only">Search policies</span>
          <input placeholder="Search policies" type="search" />
        </label>
        <button className="secondary-button" type="button">All categories</button>
      </div>
      <div className="policy-grid">
        {policies.map((policy) => (
          <article className="policy-card panel" key={policy.name}>
            <div className="policy-icon"><BookOpen aria-hidden="true" size={20} /></div>
            <div className="policy-card-body">
              <div className="policy-card-topline"><span>{policy.category}</span><StatusBadge status={policy.status} /></div>
              <h2>{policy.name}</h2>
              <p>{policy.version} · Available for review</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Policies
