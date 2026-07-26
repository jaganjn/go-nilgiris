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

import type { AccountProfile } from "@/types/account";

import type {
  Business,
  BusinessApprovalStatus,
  BusinessInput,
} from "@/types/business";

const collectionName = "businesses";

function mapBusiness(
  businessDocument: {
    id: string;
    data: () => unknown;
  }
): Business {
  return {
    id: businessDocument.id,
    ...(businessDocument.data() as Omit<
      Business,
      "id"
    >),
  };
}

function isPublicBusiness(
  business: Business
): boolean {
  return (
    !business.approvalStatus ||
    business.approvalStatus === "approved"
  );
}

export async function listBusinesses(): Promise<
  Business[]
> {
  const businesses = await listAllBusinesses();

  return businesses.filter(isPublicBusiness);
}

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

export async function getBusiness(
  id: string
): Promise<Business | null> {
  const canonicalId = businessAliases[id] ?? id;

  if (!firebaseConfigured || !db) {
    return (
      seedBusinesses.find(
        (business) => business.id === canonicalId
      ) ?? null
    );
  }

  try {
    const snapshot = await getDoc(
      doc(db, collectionName, canonicalId)
    );

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as Business;
    }
  } catch {
    // Firestore unavailable. Seed data is used below.
  }

  return (
    seedBusinesses.find(
      (business) => business.id === canonicalId
    ) ?? null
  );
}

export async function getPublicBusiness(
  id: string
): Promise<Business | null> {
  const business = await getBusiness(id);

  if (!business || !isPublicBusiness(business)) {
    return null;
  }

  return business;
}

export async function saveBusiness(
  input: BusinessInput
): Promise<string> {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  const businessId = input.id.trim();

  if (!businessId) {
    throw new Error("Business ID is required.");
  }

  const businessReference = doc(
    db,
    collectionName,
    businessId
  );

  const existingBusiness = await getDoc(
    businessReference
  );

  const newBusinessDefaults =
    existingBusiness.exists()
      ? {}
      : {
          submittedBy: "admin" as const,
          approvalStatus: "approved" as const,
          createdAt: serverTimestamp(),
        };

  await setDoc(
    businessReference,
    {
      ...input,
      id: businessId,
      ...newBusinessDefaults,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  return businessId;
}

export async function submitOwnerBusiness(
  input: BusinessInput,
  owner: AccountProfile
): Promise<string> {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  if (
    owner.role !== "owner" ||
    owner.status !== "active"
  ) {
    throw new Error(
      "Only approved business owners can submit listings."
    );
  }

  const businessId = input.id.trim();

  if (!businessId) {
    throw new Error("Business ID is required.");
  }

  const businessReference = doc(
    db,
    collectionName,
    businessId
  );

  const existingBusiness = await getDoc(
    businessReference
  );

  if (existingBusiness.exists()) {
    throw new Error(
      "This business name or URL is already being used. Please use a different business name."
    );
  }

  await setDoc(businessReference, {
    ...input,
    id: businessId,

    ownerId: owner.uid,
    ownerName: owner.displayName,
    ownerEmail: owner.email,

    submittedBy: "owner",
    approvalStatus: "pending",
    rejectionReason: "",

    verified: false,
    featured: false,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return businessId;
}

export async function updateBusinessApproval(
  businessId: string,
  approvalStatus: BusinessApprovalStatus,
  rejectionReason = ""
): Promise<void> {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  if (
    approvalStatus !== "pending" &&
    approvalStatus !== "approved" &&
    approvalStatus !== "rejected"
  ) {
    throw new Error(
      "Invalid business approval status."
    );
  }

  await updateDoc(
    doc(db, collectionName, businessId),
    {
      approvalStatus,
      rejectionReason:
        approvalStatus === "rejected"
          ? rejectionReason.trim()
          : "",
      updatedAt: serverTimestamp(),
    }
  );
}

export async function removeBusiness(
  id: string
): Promise<void> {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  await deleteDoc(
    doc(db, collectionName, id)
  );
}
