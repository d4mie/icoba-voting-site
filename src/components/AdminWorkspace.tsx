"use client";

import { useCallback, useState } from "react";
import { AdminCategoryManager } from "@/components/AdminCategoryManager";
import { AdminNomineeManager } from "@/components/AdminNomineeManager";

type Item = { id: string; title: string; description: string | null };
type Nominee = {
  id: string;
  full_name: string;
  house: string;
  photo_url: string | null;
  position_id: string | null;
  award_id: string | null;
};

export function AdminWorkspace({
  initialPositions,
  initialAwards,
  initialNominees,
}: {
  initialPositions: Item[];
  initialAwards: Item[];
  initialNominees: Nominee[];
}) {
  const [positions, setPositions] = useState(initialPositions);
  const [awards, setAwards] = useState(initialAwards);

  const onPositionsChange = useCallback((items: Item[]) => {
    setPositions(items);
  }, []);

  const onAwardsChange = useCallback((items: Item[]) => {
    setAwards(items);
  }, []);

  return (
    <>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminCategoryManager
          type="positions"
          initialItems={initialPositions}
          onItemsChange={onPositionsChange}
        />
        <AdminCategoryManager
          type="awards"
          initialItems={initialAwards}
          onItemsChange={onAwardsChange}
        />
      </div>

      <div className="mt-6">
        <AdminNomineeManager
          positions={positions.map((p) => ({ id: p.id, title: p.title }))}
          awards={awards.map((a) => ({ id: a.id, title: a.title }))}
          initialNominees={initialNominees}
        />
      </div>
    </>
  );
}
