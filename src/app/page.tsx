"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
      {user && (
        <div className="mb-4 text-sm text-gray-600">
          로그인: {user.user_metadata?.nickname || user.email}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">내 관계 목록</h1>
      <Link href="/relationships/new">
        <Button className="mb-6">+ 새 관계 생성</Button>
      </Link>
      <div className="space-y-4">
        {relationships.length === 0 && <div>참여 중인 관계가 없습니다.</div>}
        {relationships.map((rel) => (
          <div key={rel.id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <div className="text-lg font-bold mb-1 flex items-center gap-2">
                {editNameId === rel.id ? (
                  <>
                    <input
                      className="border rounded px-2 py-1"
                      value={editNameValue}
                      onChange={e => setEditNameValue(e.target.value)}
                      maxLength={30}
                    />
                    <Button size="sm" onClick={() => handleSaveName(rel.id)} disabled={!editNameValue.trim()}>
                      저장
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditNameId(null)}>
                      취소
                    </Button>
                  </>
                ) : (
                  <>
                    {myRelationshipNames[rel.id] || <span className="text-gray-400">(별칭 없음)</span>}
                    <Button size="sm" variant="outline" onClick={() => handleEditName(rel.id)}>
                      수정
                    </Button>
                  </>
                )}
              </div>
              <div className="text-sm mb-1">
                상대방: {otherProfiles[rel.id]?.nickname ? otherProfiles[rel.id].nickname : <span className="text-gray-400">(미참여)</span>}
              </div>
              <div className="text-sm mb-1">내 역할: {rel.parent_user_id === user.id ? "부모" : "자녀"}</div>
            </div>
            <Link href={`/r/${rel.hash_code}`}>
              <Button>입장</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}