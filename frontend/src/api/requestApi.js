import { requestJson } from './apiClient'

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate).toLocaleDateString()
  const end = new Date(endDate).toLocaleDateString()
  return start === end ? start : `${start} - ${end}`
}

export async function fetchEmployeeRequests(employeeId) {
  const [leaveRequests, reimbursementClaims] = await Promise.all([
    requestJson('/leave-requests/'),
    requestJson('/reimbursement-claims/'),
  ])

  const mappedLeaveRequests = (leaveRequests || [])
    .filter((request) => request.employee_id === employeeId)
    .map((request) => ({
      id: `leave-${request.id}`,
      type: request.request_type,
      date: formatDateRange(request.start_date, request.end_date),
      detail: request.reason,
      status: request.status,
    }))

  const mappedClaims = (reimbursementClaims || [])
    .filter((claim) => claim.employee_id === employeeId)
    .map((claim) => ({
      id: `claim-${claim.id}`,
      type: claim.category,
      date: new Date(claim.expense_date).toLocaleDateString(),
      detail: `${claim.currency} ${claim.claim_amount}`,
      status: claim.approval_status,
    }))

  return [...mappedLeaveRequests, ...mappedClaims]
}
