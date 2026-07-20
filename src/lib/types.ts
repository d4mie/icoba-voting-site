export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  votes_submitted_at: string | null;
};

export type ElectionSettings = {
  is_open: boolean;
};

export type Position = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export type Award = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export type Nominee = {
  id: string;
  full_name: string;
  house: string;
  photo_url: string | null;
  position_id: string | null;
  award_id: string | null;
  sort_order: number;
};

export type DraftVote = {
  id: string;
  user_id: string;
  nominee_id: string;
  position_id: string | null;
  award_id: string | null;
  updated_at: string;
};

export type CategoryType = "position" | "award";
