'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Role } from '@/database/types'

interface RoleSelectProps {
  onSelect: (role: Role) => void
}

export function RoleSelect({ onSelect }: RoleSelectProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const handleSelect = (role: Role) => {
    setSelectedRole(role)
    onSelect(role)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>역할 선택</CardTitle>
        <CardDescription>
          당신의 역할을 선택해주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          variant={selectedRole === 'child' ? 'default' : 'outline'}
          className="w-full h-24 text-lg"
          onClick={() => handleSelect('child')}
        >
          자녀
        </Button>
        <Button
          variant={selectedRole === 'parent' ? 'default' : 'outline'}
          className="w-full h-24 text-lg"
          onClick={() => handleSelect('parent')}
        >
          부모
        </Button>
      </CardContent>
    </Card>
  )
} 