"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import type { CategoryType } from "@/lib/types";

type NomineePickerProps = {
  categoryType: CategoryType;
  categoryId: string;
  categoryTitle: string;
  nominees: Array<{
    id: string;
    full_name: string;
    house: string;
    photo_url: string | null;
    position_id: string | null;
    award_id: string | null;
  }>;
  initialSelectedId: string | null;
  readOnly: boolean;
};

export function NomineePicker({
  categoryType,
  categoryId,
  categoryTitle,
  nominees,
  initialSelectedId,
  readOnly,
}: NomineePickerProps) {
  const [selectedId, setSelectedId] = useState(initialSelectedId);

  async function handleSelect(nomineeId: string) {
    if (readOnly) return;

    const previous = selectedId;
    setSelectedId(nomineeId);

    const res = await fetch("/api/votes/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomineeId,
        positionId: categoryType === "position" ? categoryId : null,
        awardId: categoryType === "award" ? categoryId : null,
      }),
    });

    if (!res.ok) {
      setSelectedId(previous);
      const data = await res.json().catch(() => ({}));
      if (data.error === "Votes already submitted") {
        window.location.href = "/vote/submitted";
      }
    }
  }

  return (
    <div className="space-y-3">
      {nominees.map((nominee) => {
        const selected = selectedId === nominee.id;
        return (
          <button
            key={nominee.id}
            type="button"
            onClick={() => handleSelect(nominee.id)}
            disabled={readOnly}
            className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
              selected
                ? "border-emerald-700 bg-emerald-50"
                : "border-stone-200 bg-white hover:border-emerald-300"
            } ${readOnly ? "cursor-default" : ""}`}
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xl font-bold text-emerald-800">
              {nominee.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={nominee.photo_url}
                  alt={nominee.full_name}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                nominee.full_name.charAt(0)
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-stone-900">{nominee.full_name}</p>
              <p className="text-sm text-stone-600">House: {nominee.house}</p>
            </div>
            <div
              className={`h-5 w-5 rounded-full border-2 ${
                selected ? "border-emerald-700 bg-emerald-700" : "border-stone-300"
              }`}
            />
          </button>
        );
      })}
      {!readOnly && (
        <p className="text-xs text-emerald-100/90">
          Your pick for <strong className="text-white">{categoryTitle}</strong> is
          saved automatically. Tap another nominee to change it.
        </p>
      )}
    </div>
  );
}

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "global" });
    window.location.assign("/login");
  }

  return (
    <Button variant="secondary" onClick={handleSignOut} loading={loading}>
      Sign out
    </Button>
  );
}
