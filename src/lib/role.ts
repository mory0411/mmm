import { Role } from '@/database/types'

const ROLE_KEY = 'mory_role'

export function saveRole(role: Role) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ROLE_KEY, role)
  }
}

export function getRole(): Role | null {
  if (typeof window !== 'undefined') {
    const role = localStorage.getItem(ROLE_KEY)
    if (role === 'child' || role === 'parent') {
      return role
    }
  }
  return null
}

export function clearRole() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ROLE_KEY)
  }
} 