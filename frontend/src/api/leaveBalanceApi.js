import { requestJson } from './apiClient'

export const CURRENT_YEAR = 2026

export async function fetchLeaveBalances(employeeId) {
  const balances = await requestJson('/leave-balances/')

  return (balances || [])
    .filter((balance) => (
      balance.employee_id === employeeId && balance.year === CURRENT_YEAR
    ))
    .map((balance) => ({
      id: balance.id,
      employeeId: balance.employee_id,
      leaveType: balance.leave_type,
      totalEntitlement: Number(balance.total_entitlement),
      usedDays: Number(balance.used_days),
      remainingDays: Number(balance.remaining_days),
      year: balance.year,
    }))
}
