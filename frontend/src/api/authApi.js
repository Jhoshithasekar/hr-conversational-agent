import { requestJson } from './apiClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export async function login(email, password) {
  const response = await requestJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  return {
    access_token: response.access_token,
    token_type: response.token_type,
    employee_id: response.employee_id,
    name: response.name,
    email: response.email,
    role: response.role,
  }
}

export async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    let detail = 'Unable to load the current user.'
    try {
      const data = await response.json()
      detail = data?.detail || detail
    } catch {
      // Ignore JSON parsing errors and fall back to the default message.
    }

    throw new Error(detail)
  }

  const data = await response.json()

  return {
    employee_id: data.employee_id,
    name: data.name,
    email: data.email,
    role: data.role,
  }
}
