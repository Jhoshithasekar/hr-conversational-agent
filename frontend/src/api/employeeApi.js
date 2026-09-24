const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api'

export const EMPLOYEE_ID = 1

export class EmployeeApiError extends Error {
  constructor(message, status = null) {
    super(message)
    this.name = 'EmployeeApiError'
    this.status = status
  }
}

export async function fetchEmployee(employeeId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/employees/${employeeId}`
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new EmployeeApiError(
          'Employee was not found.',
          response.status
        )
      }

      throw new EmployeeApiError(
        'Unable to load employee profile.',
        response.status
      )
    }

    const data = await response.json()

    if (!data || !data.id || !data.name) {
      throw new EmployeeApiError(
        'Employee profile returned no usable data.'
      )
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      department_id: data.department_id,
      manager_id: data.manager_id,
      role: data.role,
      status: data.status,
      initials: data.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    }
  } catch (error) {
    if (error instanceof EmployeeApiError) {
      throw error
    }

    throw new EmployeeApiError(
      'Unable to connect to the HR API.'
    )
  }
}