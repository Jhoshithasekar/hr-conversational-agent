import {
  BriefcaseBusiness,
  ChevronRight,
  UserRound,
} from 'lucide-react'

function ProfileCard({ employee }) {
  if (!employee) {
    return null
  }

  const initials =
    employee.name
      ?.split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'NA'

  return (
    <section className="profile-card">
      <div className="avatar avatar-large">
        {initials}
      </div>

      <div className="profile-identity">
        <span className="eyebrow">
          Employee profile
        </span>

        <h2>{employee.name}</h2>

        <p>
          {employee.role || 'Role not available'}
        </p>
      </div>

      <div className="profile-meta">
        <div>
          <span>
            <UserRound aria-hidden="true" size={15} />
            Reporting manager
          </span>

          <strong>
            {employee.manager_id
              ? `Manager #${employee.manager_id}`
              : 'Not assigned'}
          </strong>
        </div>

        <div>
          <span>
            <BriefcaseBusiness
              aria-hidden="true"
              size={15}
            />
            Department
          </span>

          <strong>
            {employee.departmentName ||
              'Not available'}
          </strong>
        </div>
      </div>

      <button
        className="profile-link"
        type="button"
      >
        View profile
        <ChevronRight
          aria-hidden="true"
          size={17}
        />
      </button>
    </section>
  )
}

export default ProfileCard