import { ApiError, requestJson } from './apiClient'

export class ManagerApiError extends Error {
  constructor(message, status = null) {
    super(message)
    this.name = 'ManagerApiError'
    this.status = status
  }
}

/**
 * Fetch manager dashboard metrics and recent direct-report activity.
 */
export async function fetchManagerDashboard() {
  try {
    return await requestJson('/manager/dashboard')
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ManagerApiError(error.message, error.status)
    }
    throw new ManagerApiError('Unable to load manager dashboard.')
  }
}

/**
 * Fetch list of direct reports assigned to the authenticated manager.
 */
export async function fetchManagerTeam() {
  try {
    return await requestJson('/manager/team')
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ManagerApiError(error.message, error.status)
    }
    throw new ManagerApiError('Unable to load direct reports.')
  }
}

/**
 * Fetch requests submitted by direct reports with optional filters.
 *
 * @param {Object} filters
 * @param {string} [filters.status] - 'all' | 'Pending' | 'Approved' | 'Rejected'
 * @param {string} [filters.requestType] - 'all' | 'Work from home' | 'Sick Leave' | etc.
 * @param {string} [filters.search] - Search text for employee name or reason
 */
export async function fetchManagerRequests(filters = {}) {
  try {
    const queryParams = new URLSearchParams()
    if (filters.status && filters.status.toLowerCase() !== 'all') {
      queryParams.append('status', filters.status)
    }
    if (filters.requestType && filters.requestType.toLowerCase() !== 'all') {
      queryParams.append('request_type', filters.requestType)
    }
    if (filters.search && filters.search.trim()) {
      queryParams.append('search', filters.search.trim())
    }

    const queryString = queryParams.toString()
    const path = `/manager/requests${queryString ? `?${queryString}` : ''}`
    return await requestJson(path)
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ManagerApiError(error.message, error.status)
    }
    throw new ManagerApiError('Unable to load team requests.')
  }
}

/**
 * Fetch comprehensive detail for a single request.
 *
 * @param {number|string} requestId
 */
export async function fetchManagerRequestDetail(requestId) {
  try {
    return await requestJson(`/manager/requests/${requestId}`)
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ManagerApiError(error.message, error.status)
    }
    throw new ManagerApiError('Unable to load request details.')
  }
}

/**
 * Approve a pending leave or WFH request with an optional manager comment.
 *
 * @param {number|string} requestId
 * @param {string} [comment]
 */
export async function approveRequest(requestId, comment = '') {
  try {
    return await requestJson(`/leave-requests/${requestId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ comment: comment.trim() }),
    })
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ManagerApiError(error.message, error.status)
    }
    throw new ManagerApiError('Unable to approve request.')
  }
}

/**
 * Reject a pending leave or WFH request with an optional manager comment.
 *
 * @param {number|string} requestId
 * @param {string} [comment]
 */
export async function rejectRequest(requestId, comment = '') {
  try {
    return await requestJson(`/leave-requests/${requestId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ comment: comment.trim() }),
    })
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ManagerApiError(error.message, error.status)
    }
    throw new ManagerApiError('Unable to reject request.')
  }
}
