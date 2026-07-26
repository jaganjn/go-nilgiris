import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  businessAliases,
  seedBusinesses,
} from "@/data/seedBusinesses";

import {
  db,
  firebaseConfigured,
} from "@/lib/firebase";

import type {
  Business,
  BusinessApprovalStatus,
  BusinessInput,
} from "@/types/business";

import type { AccountProfile } from "@/types/account";

const collectionName = "businesses";

function mapBusiness(
  businessDocument: {
    id: string;
    data: () => unknown;
  }
): Business {
  return {
    id: businessDocument.id,
    ...(businessDocument.data() as Omit<Business, "id">),
  };
}

function isPublicBusiness(business: Business) {
  return (
    !business.approvalStatus ||
    business.approvalStatus === "approved"
  );
}

/**
 * Used by the public Explore page.
 * Pending and rejected owner submissions are hidden.
 */
export async function listBusinesses(): Promise<
  Business[]
> {
  const businesses = await listAllBusinesses();

  return businesses.filter(isPublicBusiness);
}

/**
 * Used by the admin dashboard.
 * Returns approved, pending and rejected businesses.
 */
export async function listAllBusinesses(): Promise<
  Business[]
> {
  if (!firebaseConfigured || !db) {
    return seedBusinesses;
  }

  try {
    const snapshot = await getDocs(
      query(
        collection(db, collectionName),
        orderBy("name")
      )
    );

    if (snapshot.empty) {
      return seedBusinesses;
    }

    return snapshot.docs.map(mapBusiness);
  } catch {
    return seedBusinesses;
  }
}

/**
 * Loads all businesses submitted by one owner.
 */
export async function listOwnerBusinesses(
  ownerId: string
): Promise<Business[]> {
  if (!firebaseConfigured || !db || !ownerId) {
    return [];
  }

  const snapshot = await getDocs(
    query(
      collection(db, collectionName),
      where("ownerId", "==", ownerId)
    )
  );

  return snapshot.docs
    .map(mapBusiness)
    .sort((first, second) =>
      first.name.localeCompare(second.name)
    );
}

/**
 * Loads any
