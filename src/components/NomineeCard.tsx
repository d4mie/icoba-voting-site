"use client";

import Image from "next/image";
import { useState } from "react";
import type { Nominee } from "@/lib/types";

type NomineeCardProps = {
  nominee: Nominee;
  selected: boolean;
  disabled?: boolean;
  onSelect: (nomineeId: string) => void;
};

export function NomineeCard({
  nominee,
  selected,
  disabled,
  onSelect,
}: NomineeCardProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSelect() {
    if (disabled || selected) return;
    setSaving(true);
    setSaved(false);

    const body = {
      nomineeId: nominee.id,
      positionId: nominee.position_id,
      awardId: nominee.award_id,
    };

    const res = await fetch("/api/votes/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (res.ok) {
      setSaved(true);
      onSelect(nominee.id);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSelect}
      disabled={disabled || saving}
      className={`w-full rounded-2xl border-2 p-4 text-left transition ${
        selected
          ? "border-emerald-700 bg-emerald-50 shadow-sm"
          : "border-stone-200 bg-white hover:border-emerald-300 hover:shadow-sm"
      } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
          {nominee.photo_url ? (
            <Image
              src={nominee.photo_url}
              alt={nominee.full_name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-emerald-800">
              {nominee.full_name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-stone-900">
            {nominee.full_name}
          </p>
          <p className="text-sm text-stone-600">House: {nominee.house}</p>
          {selected && (
            <p className="mt-1 text-xs font-medium text-emerald-700">
              {saving ? "Saving…" : saved ? "Saved" : "Selected"}
            </p>
          )}
        </div>
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
            selected
              ? "border-emerald-700 bg-emerald-700 text-white"
              : "border-stone-300"
          }`}
        >
          {selected && (
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
