import { BriefcaseBusiness, ChevronRight, UserRound } from 'lucide-react'

function ProfileCard({ employee }) {
  return (
    <section className="profile-card">
      <div className="avatar avatar-large">{employee.initials}</div>
      <div className="profile-identity">
        <span className="eyebrow">Employee profile</span>
        <h2>{employee.name}</h2>
        <p>{employee.designation}</p>
      </div>
      <div className="profile-meta">
        <div>
          <span><UserRound aria-hidden="true" size={15} /> Reporting manager</span>
          <strong>{employee.manager}</strong>
        </div>
        <div>
          <span><BriefcaseBusiness aria-hidden="true" size={15} /> Work profile</span>
          <strong>Engineering</strong>
        </div>
      </div>
      <button className="profile-link" type="button">
        View profile <ChevronRight aria-hidden="true" size={17} />
      </button>
    </section>
  )
}

export default ProfileCard
