export type AccountRole = "admin" | "owner";

export type AccountStatus =
  | "pending"
  | "active"
  | "suspended";

export type AccountProfile = {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  role: AccountRole;
  status: AccountStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type OwnerRegistrationInput = {
  displayName: string;
  email: string;
  phone: string;
};
