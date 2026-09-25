export const AUTH_STATUS = {
  INITIALIZING: 'INITIALIZING',
  AUTHENTICATED: 'AUTHENTICATED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
}

/**
 * Normalizes user role string to one of the canonical application roles:
 * - 'Employee'
 * - 'Manager'
 * - 'HR'
 * - 'ICC'
 */
export function normalizeRole(role) {
  const normalized = (role || '').trim().toLowerCase()
  if (normalized === 'icc' || normalized.includes('icc')) return 'ICC'
  if (normalized === 'hr' || normalized.includes('hr')) return 'HR'
  if (normalized.includes('manager')) return 'Manager'
  if (normalized.includes('engineer') || normalized.includes('employee')) return 'Employee'
  return 'Employee'
}

/**
 * Returns the default workspace entry route for a given user role.
 *
 * Supported defaults:
 * - Employee / Software Engineer -> /employee
 * - Manager -> /manager
 * - HR -> /hr
 * - ICC -> /icc
 */
export function getDefaultWorkspaceRoute(role) {
  const norm = normalizeRole(role)
  switch (norm) {
    case 'ICC':
      return '/icc'
    case 'HR':
      return '/hr'
    case 'Manager':
      return '/manager'
    case 'Employee':
    default:
      return '/employee'
  }
}

/**
 * Verifies whether a given path is authorized for the specified role.
 *
 * Authorization rules:
 * - /manager/*  -> Manager only
 * - /employee/* -> Employee and Manager
 * - /hr/*       -> HR only
 * - /icc/*      -> ICC only
 */
export function isPathAllowedForRole(pathname, role) {
  if (!pathname) return false
  const norm = normalizeRole(role)
  const path = pathname.toLowerCase()

  if (path.startsWith('/manager')) {
    return norm === 'Manager'
  }

  if (path.startsWith('/hr')) {
    return norm === 'HR'
  }

  if (path.startsWith('/icc')) {
    return norm === 'ICC'
  }

  if (path.startsWith('/employee')) {
    return norm === 'Employee' || norm === 'Manager'
  }

  return false
}
