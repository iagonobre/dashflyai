export type User = {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  phone: string | null;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  role: string;
  stores?: Store[];
};

export type Store = {
  id: string;
  name: string;
  url: string;
};
