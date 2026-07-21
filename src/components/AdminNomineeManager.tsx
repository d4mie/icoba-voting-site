"use client";

import { useEffect, useRef, useState } from "react";
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [categoryType, setCategoryType] = useState<"position" | "award">("position");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = categoryType === "position" ? positions : awards;

  // Keep dropdown selection valid when positions/awards lists change
  useEffect(() => {
    if (categories.length === 0) {
      setCategoryId("");
      return;
    }
    if (!categories.some((c) => c.id === categoryId)) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  async function refresh() {
    const res = await fetch("/api/admin/nominees");
    const data = await res.json();
    if (data.nominees) setNominees(data.nominees);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be smaller than 5MB.");
      return;
    }

    setError(null);
    setUploading(true);
    setPhotoPreview(URL.createObjectURL(file));

    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body,
    });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? "Photo upload failed");
      setPhotoPreview(null);
      setPhotoUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setPhotoUrl(data.url);
  }

  function clearPhoto() {
    setPhotoUrl("");
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError(
        categoryType === "position"
          ? "Add a position first, then assign the nominee."
          : "Add an award first, then assign the nominee."
      );
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin/nominees", {
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

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to add nominee");
      return;
    }

    setFullName("");
    setHouse("");
    clearPhoto();
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this nominee?")) return;
    await fetch(`/api/admin/nominees/${id}`, { method: "DELETE" });
    await refresh();
  }

  const categoryLabel = categories.find((c) => c.id === categoryId)?.title;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">Nominees</h2>
      <p className="mt-1 text-sm text-stone-600">
        Choose Position or Award, pick from your list, then add the nominee.
      </p>

      <form onSubmit={handleAdd} className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            required
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
          />
          <input
            type="text"
            required
            placeholder="School house"
            value={house}
            onChange={(e) => setHouse(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
          />
        </div>

        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4">
          <label className="block text-sm font-medium text-stone-800">
            Nominee photo
          </label>
          <p className="mt-1 text-xs text-stone-500">
            Tap to choose a picture from your phone or computer (optional).
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handlePhotoChange}
            disabled={uploading}
            className="mt-3 block w-full text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--icoba-green)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          {(photoPreview || photoUrl) && (
            <div className="mt-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview || photoUrl}
                alt="Nominee preview"
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="text-xs text-stone-600">
                {uploading ? "Uploading…" : "Photo ready"}
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="mt-1 block font-medium text-red-600 hover:underline"
                >
                  Remove photo
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={categoryType}
            onChange={(e) => {
              const next = e.target.value as "position" | "award";
              setCategoryType(next);
            }}
            className="rounded-lg border px-3 py-2 text-sm text-slate-900"
          >
            <option value="position">Position</option>
            <option value="award">Award</option>
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="min-w-48 flex-1 rounded-lg border px-3 py-2 text-sm text-slate-900"
          >
            {categories.length === 0 ? (
              <option value="">
                {categoryType === "position"
                  ? "No positions yet — add one above"
                  : "No awards yet — add one above"}
              </option>
            ) : (
              categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))
            )}
          </select>
        </div>

        {categoryLabel && (
          <p className="text-xs text-stone-500">
            Assigning nominee to: <strong>{categoryLabel}</strong>
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" loading={loading || uploading} disabled={!categoryId}>
          Add nominee
        </Button>
      </form>

      <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
        {nominees.map((n) => {
          const place =
            positions.find((p) => p.id === n.position_id)?.title ||
            awards.find((a) => a.id === n.award_id)?.title ||
            "Unassigned";
          return (
            <li
              key={n.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-stone-100 px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                {n.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.photo_url}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 font-semibold text-emerald-800">
                    {n.full_name.charAt(0)}
                  </div>
                )}
                <span className="truncate">
                  {n.full_name} · {n.house}
                  <span className="block text-xs text-stone-500">{place}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(n.id)}
                className="shrink-0 text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
