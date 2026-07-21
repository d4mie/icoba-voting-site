"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";

type Item = { id: string; title: string; description: string | null };

export function AdminCategoryManager({
  type,
  initialItems,
  onItemsChange,
}: {
  type: "positions" | "awards";
  initialItems: Item[];
  onItemsChange?: (items: Item[]) => void;
}) {
  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onItemsChange?.(items);
  }, [items, onItemsChange]);

  async function refresh() {
    const res = await fetch(`/api/admin/${type}`);
    const data = await res.json();
    if (data.items) setItems(data.items);
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description ?? "");
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = editingId
      ? await fetch(`/api/admin/${type}/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        })
      : await fetch(`/api/admin/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save");
      return;
    }

    cancelEdit();
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item and its nominees?")) return;
    await fetch(`/api/admin/${type}/${id}`, { method: "DELETE" });
    if (editingId === id) cancelEdit();
    await refresh();
  }

  const label = type === "positions" ? "Position" : "Award";

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">{label}s</h2>
      <p className="mt-1 text-sm text-stone-600">
        {editingId
          ? `Editing this ${label.toLowerCase()}. Update the fields, then save.`
          : `Add a new ${label.toLowerCase()}, or tap Edit on one below.`}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          type="text"
          required
          placeholder={`${label} title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={loading}>
            {editingId ? `Save ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={`rounded-lg border px-3 py-2 text-sm ${
              editingId === item.id
                ? "border-emerald-400 bg-emerald-50"
                : "border-stone-100"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-stone-900">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs text-stone-500">{item.description}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="font-medium text-emerald-800 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm text-stone-500">No {label.toLowerCase()}s yet.</li>
        )}
      </ul>
    </div>
  );
}
