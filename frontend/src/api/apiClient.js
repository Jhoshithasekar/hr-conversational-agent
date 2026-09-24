const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export class ApiError extends Error {
  constructor(message, status = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function requestJson(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      ...options,
    })
  } catch {
    throw new ApiError('Unable to connect to the HR API.')
  }

  let data
  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    throw new ApiError(
      data?.detail || 'The HR API returned an error.',
      response.status,
    )
  }

  return data
}
