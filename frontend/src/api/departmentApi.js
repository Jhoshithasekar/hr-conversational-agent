const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api'

export class DepartmentApiError extends Error {
  constructor(message, status = null) {
    super(message)
    this.name = 'DepartmentApiError'
    this.status = status
  }
}

export async function fetchDepartment(departmentId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/departments/${departmentId}`
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new DepartmentApiError(
          'Department was not found.',
          response.status
        )
      }

      throw new DepartmentApiError(
        'Unable to load department.',
        response.status
      )
    }

    const data = await response.json()

    if (!data || !data.id || !data.name) {
      throw new DepartmentApiError(
        'Department data is incomplete.'
      )
    }

    return data
  } catch (error) {
    if (error instanceof DepartmentApiError) {
      throw error
    }

    throw new DepartmentApiError(
      'Unable to connect to the HR API.'
    )
  }
}