'use client'

import { useEffect, useState } from 'react'
import { RoleSelect } from '@/components/role-select'
import { Role } from '@/database/types'
import { getRole, saveRole } from '@/lib/role'

export default function Home() {
  const [role, setRole] = useState<Role | null>(null)

  useEffect(() => {
    const savedRole = getRole()
    if (savedRole) {
      setRole(savedRole)
    }
  }, [])

  const handleRoleSelect = (selectedRole: Role) => {
    saveRole(selectedRole)
    setRole(selectedRole)
  }

  if (!role) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <RoleSelect onSelect={handleRoleSelect} />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">
        {role === 'child' ? '자녀' : '부모'}로 로그인했습니다
      </h1>
    </main>
  )
}
