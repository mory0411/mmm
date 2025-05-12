"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [myRelationshipNames, setMyRelationshipNames] = useState<{ [relationshipId: string]: string }>({});
  const [editNameId, setEditNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>("");
  const [otherProfiles, setOtherProfiles] = useState<{ [relationshipId: string]: { nickname?: string; email?: string } }>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("relationships")
      .select("*")
      .or(`parent_user_id.eq.${user.id},child_user_id.eq.${user.id}`)
      .then(({ data }) => setRelationships(data || []));
  }, [user]);

  useEffect(() => {
    if (!user || relationships.length === 0) return;
    const fetchNames = async () => {
      const { data } = await supabase
        .from("relationship_names")
        .select("relationship_id, name")
        .in("relationship_id", relationships.map((r) => r.id))
        .eq("user_id", user.id);
      const nameMap: { [relationshipId: string]: string } = {};
      (data || []).forEach((row) => {
        nameMap[row.relationship_id] = row.name;
      });
      setMyRelationshipNames(nameMap);
    };
    fetchNames();
  }, [user, relationships]);

  useEffect(() => {
    if (!user || relationships.length === 0) return;
    const fetchOthers = async () => {
      const otherUserIds = relationships.map((rel) => {
        if (rel.parent_user_id === user.id) return rel.child_user_id;
        if (rel.child_user_id === user.id) return rel.parent_user_id;
        return null;
      }).filter(Boolean);
      if (otherUserIds.length === 0) return;
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", otherUserIds);
      const profileMap: { [id: string]: { nickname?: string } } = {};
      (profiles || []).forEach((p) => {
        profileMap[p.id] = { nickname: p.nickname };
      });
      const relMap: { [relationshipId: string]: { nickname?: string } } = {};
      relationships.forEach((rel) => {
        const otherId = rel.parent_user_id === user.id ? rel.child_user_id : rel.parent_user_id;
        if (otherId && profileMap[otherId]) {
          relMap[rel.id] = profileMap[otherId];
        }
      });
      setOtherProfiles(relMap);
    };
    fetchOthers();
  }, [user, relationships]);

  const handleEditName = (relId: string) => {
    setEditNameId(relId);
    setEditNameValue(myRelationshipNames[relId] || "");
  };

  const handleSaveName = async (relId: string) => {
    if (!user) return;
    const { error } = await supabase.from("relationship_names").upsert({
      relationship_id: relId,
      user_id: user.id,
      name: editNameValue.trim(),
    });
    if (error) {
      alert("저장 실패: " + error.message);
      return;
    }
    setMyRelationshipNames((prev) => ({ ...prev, [relId]: editNameValue.trim() }));
    setEditNameId(null);
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-foreground/90">MORY</h1>
        {user && (
          <Link href="/relationships/new">
            <Button>새로운 관계 만들기</Button>
          </Link>
        )}
      </div>

      {user ? (
        <div className="space-y-4">
          {relationships.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">아직 관계가 없습니다.</p>
              <Link href="/relationships/new">
                <Button>첫 번째 관계 만들기</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {relationships.map((rel) => (
                <div key={rel.id} className="border rounded-lg p-4 bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="text-base font-medium text-foreground mb-2">
                        {editNameId === rel.id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={editNameValue}
                              onChange={(e) => setEditNameValue(e.target.value)}
                              className="text-base px-2 py-1 border rounded-lg bg-background w-full"
                              placeholder="관계 이름을 입력하세요"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSaveName(rel.id)}>저장</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditNameId(null)}>취소</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>{myRelationshipNames[rel.id] || "이름 없음"}</span>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-muted-foreground hover:text-muted-foreground/80 border-muted-foreground/30 hover:border-muted-foreground/50" onClick={() => handleEditName(rel.id)}>
                              이름수정
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">내 역할: {rel.parent_user_id === user.id ? "부모" : "자녀"}</div>
                      <div className="text-sm text-muted-foreground mb-1">상대방: {otherProfiles[rel.id]?.nickname || "이름 없음"}</div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/r/${rel.hash_code}`} className="flex-1">
                        <Button size="sm" className="w-full">입장하기</Button>
                      </Link>
                      <Button variant="secondary" size="sm" className="flex-1" onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/r/${rel.hash_code}`);
                        toast("공유 링크가 복사되었습니다!");
                      }}>
                        공유하기기
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4 text-foreground/90">가족과의 소중한 대화를 기록하세요</h2>
          <p className="text-muted-foreground mb-8">매일 하나의 질문으로 가족과의 대화를 이어가세요.</p>
          <Link href="/auth/login">
            <Button size="lg">시작하기</Button>
          </Link>
        </div>
      )}
    </div>
  );
}