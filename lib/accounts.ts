import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db, firebaseConfigured } from "@/lib/firebase";
import type {
  AccountProfile,
  AccountStatus,
  OwnerRegistrationInput,
} from "@/types/account";

const collectionName = "accounts";

export async function getAccountProfile(
  uid: string
): Promise<AccountProfile | null> {
  if (!firebaseConfigured || !db) {
    return null;
  }

  const accountReference = doc(db, collectionName, uid);
  const accountSnapshot = await getDoc(accountReference);

  if (!accountSnapshot.exists()) {
    return null;
  }

  return {
    uid: accountSnapshot.id,
    ...accountSnapshot.data(),
  } as AccountProfile;
}

export async function createOwnerProfile(
  uid: string,
  input: OwnerRegistrationInput
): Promise<void> {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  await setDoc(doc(db, collectionName, uid), {
    uid,
    displayName: input.displayName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    role: "owner",
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function listOwnerProfiles(): Promise<
  AccountProfile[]
> {
  if (!firebaseConfigured || !db) {
    return [];
  }

  const snapshot = await getDocs(
    collection(db, collectionName)
  );

  const owners = snapshot.docs
    .map(
      (accountDocument) =>
        ({
          uid: accountDocument.id,
          ...accountDocument.data(),
        }) as AccountProfile
    )
    .filter((account) => account.role === "owner");

  return owners.sort((first, second) => {
    const firstTime = getTimestampMilliseconds(
      first.createdAt
    );

    const secondTime = getTimestampMilliseconds(
      second.createdAt
    );

    return secondTime - firstTime;
  });
}

export async function updateOwnerStatus(
  uid: string,
  status: AccountStatus
): Promise<void> {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  if (
    status !== "pending" &&
    status !== "active" &&
    status !== "suspended"
  ) {
    throw new Error("Invalid owner account status.");
  }

  await updateDoc(doc(db, collectionName, uid), {
    status,
    updatedAt: serverTimestamp(),
  });
}

function getTimestampMilliseconds(value: unknown) {
  if (!value || typeof value !== "object") {
    return 0;
  }

  const timestamp = value as {
    toMillis?: () => number;
    seconds?: number;
  };

  if (typeof timestamp.toMillis === "function") {
    return timestamp.toMillis();
  }

  if (typeof timestamp.seconds === "number") {
    return timestamp.seconds * 1000;
  }

  return 0;
}
