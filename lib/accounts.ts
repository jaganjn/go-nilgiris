import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db, firebaseConfigured } from "@/lib/firebase";
import type {
  AccountProfile,
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
