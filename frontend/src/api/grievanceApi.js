import { requestJson } from './apiClient'

export async function submitConcern(payload) {
  return requestJson('/posh-incidents/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
