"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type Role = "parent" | "child";

export function RoleSelector() {
  const [role, setRole] = useState<Role | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as Role | null;
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    localStorage.setItem("userRole", selectedRole);
    router.refresh();
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <h2 className="text-lg font-semibold mb-4">역할 선택</h2>
      <div className="flex gap-4">
        <Card
          className={`flex-1 cursor-pointer transition-colors hover:bg-accent ${
            role === "parent" ? "border-primary" : ""
          }`}
          onClick={() => handleRoleSelect("parent")}
        >
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">부모</h3>
            <p className="text-sm text-muted-foreground">
              자녀와의 대화를 시작하는 부모님
            </p>
          </CardContent>
        </Card>
        <Card
          className={`flex-1 cursor-pointer transition-colors hover:bg-accent ${
            role === "child" ? "border-primary" : ""
          }`}
          onClick={() => handleRoleSelect("child")}
        >
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">자녀</h3>
            <p className="text-sm text-muted-foreground">
              부모님과 대화하는 자녀
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 