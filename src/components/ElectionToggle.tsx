"use client";

import { useState } from "react";
import { Button } from "./Button";

export function ElectionToggle({ initialIsOpen }: { initialIsOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/admin/election", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: !isOpen }),
    });
    setLoading(false);
    if (res.ok) {
      setIsOpen(!isOpen);
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Voting status</h2>
          <p className="mt-1 text-sm text-stone-600">
            {isOpen
              ? "Voting is open. Voters can select and change picks."
              : "Voting is closed. No new picks or changes allowed."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isOpen
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isOpen ? "OPEN" : "CLOSED"}
          </span>
          <Button
            variant={isOpen ? "danger" : "primary"}
            onClick={toggle}
            loading={loading}
          >
            {isOpen ? "Close voting" : "Open voting"}
          </Button>
        </div>
      </div>
    </div>
  );
}
