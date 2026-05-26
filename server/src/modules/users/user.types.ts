export type UserRow = {
  id: number;
  clerk_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  created_at: Date;
};

export type UserProfile = {
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
};
