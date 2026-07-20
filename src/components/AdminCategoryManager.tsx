"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

type Item = { id: string; title: string; description: string | null };

export function AdminCategoryManager({
  type,
  initialItems,
}: {
  type: "positions" | "awards";
  initialItems: Item[];
}) {
  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch(`/api/admin/${type}`);
    const data = await res.json();
    if (data.items) setItems(data.items);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to add");
      return;
    }

    setTitle("");
    setDescription("");
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item and its nominees?")) return;
    await fetch(`/api/admin/${type}/${id}`, { method: "DELETE" });
    await refresh();
  }

  const label = type === "positions" ? "Position" : "Award";

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">{label}s</h2>
      <form onSubmit={handleAdd} className="mt-4 space-y-3">
        <input
          type="text"
          required
          placeholder={`${label} title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading}>
          Add {label.toLowerCase()}
        </Button>
      </form>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2 text-sm"
          >
            <span>{item.title}</span>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
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
