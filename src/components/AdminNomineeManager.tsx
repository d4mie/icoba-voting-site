"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

type Position = { id: string; title: string };
type Award = { id: string; title: string };
type Nominee = {
  id: string;
  full_name: string;
  house: string;
  photo_url: string | null;
  position_id: string | null;
  award_id: string | null;
};

export function AdminNomineeManager({
  positions,
  awards,
  initialNominees,
}: {
  positions: Position[];
  awards: Award[];
  initialNominees: Nominee[];
}) {
  const [nominees, setNominees] = useState(initialNominees);
  const [fullName, setFullName] = useState("");
  const [house, setHouse] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [categoryType, setCategoryType] = useState<"position" | "award">("position");
  const [categoryId, setCategoryId] = useState(positions[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const res = await fetch("/api/admin/nominees");
    const data = await res.json();
    if (data.nominees) setNominees(data.nominees);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/admin/nominees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        house,
        photoUrl: photoUrl || null,
        positionId: categoryType === "position" ? categoryId : null,
        awardId: categoryType === "award" ? categoryId : null,
      }),
    });

    setLoading(false);
    setFullName("");
    setHouse("");
    setPhotoUrl("");
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this nominee?")) return;
    await fetch(`/api/admin/nominees/${id}`, { method: "DELETE" });
    await refresh();
  }

  const categories = categoryType === "position" ? positions : awards;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">Nominees</h2>
      <form onSubmit={handleAdd} className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            required
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            required
            placeholder="School house"
            value={house}
            onChange={(e) => setHouse(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <input
          type="url"
          placeholder="Photo URL (optional)"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-3">
          <select
            value={categoryType}
            onChange={(e) => {
              const next = e.target.value as "position" | "award";
              setCategoryType(next);
              setCategoryId(
                next === "position"
                  ? positions[0]?.id ?? ""
                  : awards[0]?.id ?? ""
              );
            }}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            <option value="position">Position</option>
            <option value="award">Award</option>
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="min-w-48 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" loading={loading}>
          Add nominee
        </Button>
      </form>
      <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
        {nominees.map((n) => (
          <li
            key={n.id}
            className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2 text-sm"
          >
            <span>
              {n.full_name} · {n.house}
            </span>
            <button
              type="button"
              onClick={() => handleDelete(n.id)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
