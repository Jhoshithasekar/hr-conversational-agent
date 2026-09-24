import { requestJson } from './apiClient'

export async function fetchPolicies() {
  const documents = await requestJson('/policy-documents/')

  return (documents || []).map((document) => ({
    id: document.id,
    name: document.title,
    version: document.version,
    category: document.category,
    effectiveDate: new Date(document.effective_date).toLocaleDateString(),
    status: document.is_active ? 'Active' : 'Archived',
    indexStatus: document.index_status,
  }))
}
