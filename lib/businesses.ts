import {
  collection,
  deleteDoc,
  deleteField,
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
  BusinessPendingUpdate,
  BusinessUpdateInput,
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

function preparePendingUpdate(
  input: BusinessUpdateInput
): BusinessPendingUpdate {
  return {
    name: input.name.trim(),
    category: input.category.trim(),
    icon: input.icon.trim() || "📍",
    location: input.location.trim(),
    address: input.address.trim(),

    openingHours:
      input.openingHours.trim() ||
      "Contact business for timings",

    description: input.description.trim(),

    phones: input.phones.map((phone) => ({
      label: phone.label.trim() || "Phone",
      number: phone.number.trim(),
    })),

    whatsapp:
      input.whatsapp?.trim() || "",

    website:
      input.website?.trim() || "",

    maps:
      input.maps?.trim() || "",

    services: input.services
      .map((item) => item.trim())
      .filter(Boolean),

    highlights: input.highlights
      .map((item) => item.trim())
      .filter(Boolean),

    additionalInfo: input.additionalInfo
      .map((item) => item.trim())
      .filter(Boolean),

    images: Array.from(
      new Set(
        input.images
          .map((item) => item.trim())
          .filter(Boolean)
      )
    ),

    requestedAt: serverTimestamp(),
  };
}

function getApprovedUpdateFields(
  pendingUpdate: BusinessPendingUpdate
): BusinessUpdateInput {
  return {
    name: pendingUpdate.name,
    category: pendingUpdate.category,
    icon: pendingUpdate.icon,
    location: pendingUpdate.location,
    address: pendingUpdate.address,
    openingHours:
      pendingUpdate.openingHours,
    description:
      pendingUpdate.description,
    phones: pendingUpdate.phones,
    whatsapp: pendingUpdate.whatsapp,
    website: pendingUpdate.website,
    maps: pendingUpdate.maps,
    services: pendingUpdate.services,
    highlights:
      pendingUpdate.highlights,
    additionalInfo:
      pendingUpdate.additionalInfo,
    images: pendingUpdate.images,
  };
}

export async function listBusinesses(): Promise<
  Business[]
> {
  if (!firebaseConfigured || !db) {
    return seedBusinesses;
  }

  const firestoreDb = db;

  try {
    const snapshot = await getDocs(
      query(
        collection(
          firestoreDb,
          collectionName
        ),
        where(
          "approvalStatus",
          "==",
          "approved"
        )
      )
    );

    const approvedFirestoreBusinesses =
      snapshot.docs.map(mapBusiness);

    const firestoreBusinessIds = new Set(
      approvedFirestoreBusinesses.map(
        (business) => business.id
      )
    );

    const remainingSeedBusinesses =
      seedBusinesses.filter(
        (business) =>
          !firestoreBusinessIds.has(
            business.id
          )
      );

    return [
      ...approvedFirestoreBusinesses,
      ...remainingSeedBusinesses,
    ].sort((first, second) =>
      first.name.localeCompare(second.name)
    );
  } catch {
    return seedBusinesses;
  }
}

export async function listAllBusinesses(): Promise<
  Business[]
> {
  if (!firebaseConfigured || !db) {
    return seedBusinesses;
  }

  const firestoreDb = db;

  try {
    const snapshot = await getDocs(
      query(
        collection(
          firestoreDb,
          collectionName
        ),
        orderBy("name")
      )
    );

    const firestoreBusinesses =
      snapshot.docs.map(mapBusiness);

    const firestoreBusinessIds = new Set(
      firestoreBusinesses.map(
        (business) => business.id
      )
    );

    const remainingSeedBusinesses =
      seedBusinesses.filter(
        (business) =>
          !firestoreBusinessIds.has(
            business.id
          )
      );

    return [
      ...firestoreBusinesses,
      ...remainingSeedBusinesses,
    ].sort((first, second) =>
      first.name.localeCompare(second.name)
    );
  } catch {
    return seedBusinesses;
  }
}

export async function listOwnerBusinesses(
  ownerId: string
): Promise<Business[]> {
  if (
    !firebaseConfigured ||
    !db ||
    !ownerId
  ) {
    return [];
  }

  const firestoreDb = db;

  try {
    const snapshot = await getDocs(
      query(
        collection(
          firestoreDb,
          collectionName
        ),
        where(
          "ownerId",
          "==",
          ownerId
        )
      )
    );

    return snapshot.docs
      .map(mapBusiness)
      .sort((first, second) =>
        first.name.localeCompare(second.name)
      );
  } catch {
    return [];
  }
}

export async function getBusiness(
  id: string
): Promise<Business | null> {
  const canonicalId =
    businessAliases[id] ?? id;

  if (!firebaseConfigured || !db) {
    return (
      seedBusinesses.find(
        (business) =>
          business.id === canonicalId
      ) ?? null
    );
  }

  const firestoreDb = db;

  try {
    const snapshot = await getDoc(
      doc(
        firestoreDb,
        collectionName,
        canonicalId
      )
    );

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as Business;
    }
  } catch {
    // Seed business lookup is used below.
  }

  return (
    seedBusinesses.find(
      (business) =>
        business.id === canonicalId
    ) ?? null
  );
}

export async function getPublicBusiness(
  id: string
): Promise<Business | null> {
  const business = await getBusiness(id);

  if (
    !business ||
    !isPublicBusiness(business)
  ) {
    return null;
  }

  return business;
}

export async function saveBusiness(
  input: BusinessInput
): Promise<string> {
  if (!firebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured."
    );
  }

  const firestoreDb = db;
  const businessId = input.id.trim();

  if (!businessId) {
    throw new Error(
      "Business ID is required."
    );
  }

  const businessReference = doc(
    firestoreDb,
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
          approvalStatus:
            "approved" as const,
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
    throw new Error(
      "Firebase is not configured."
    );
  }

  if (
    owner.role !== "owner" ||
    owner.status !== "active"
  ) {
    throw new Error(
      "Only approved business owners can submit listings."
    );
  }

  const firestoreDb = db;
  const businessId = input.id.trim();

  if (!businessId) {
    throw new Error(
      "Business ID is required."
    );
  }

  const businessReference = doc(
    firestoreDb,
    collectionName,
    businessId
  );

  const existingBusiness = await getDoc(
    businessReference
  );

  const seedBusinessExists =
    seedBusinesses.some(
      (business) =>
        business.id === businessId
    );

  if (
    existingBusiness.exists() ||
    seedBusinessExists
  ) {
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

export async function submitOwnerBusinessUpdate(
  businessId: string,
  input: BusinessUpdateInput,
  owner: AccountProfile
): Promise<void> {
  if (!firebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured."
    );
  }

  if (
    owner.role !== "owner" ||
    owner.status !== "active"
  ) {
    throw new Error(
      "Only approved business owners can update listings."
    );
  }

  const firestoreDb = db;

  const businessReference = doc(
    firestoreDb,
    collectionName,
    businessId
  );

  const snapshot = await getDoc(
    businessReference
  );

  if (!snapshot.exists()) {
    throw new Error(
      "Business listing not found."
    );
  }

  const business = {
    id: snapshot.id,
    ...snapshot.data(),
  } as Business;

  if (
    business.ownerId !== owner.uid ||
    business.submittedBy !== "owner"
  ) {
    throw new Error(
      "You do not have permission to update this business."
    );
  }

  if (
    business.approvalStatus !== "approved"
  ) {
    throw new Error(
      "Only approved businesses can use the update request feature."
    );
  }

  if (input.name.trim().length < 2) {
    throw new Error(
      "Please enter the business name."
    );
  }

  if (!input.location.trim()) {
    throw new Error(
      "Please enter the business location."
    );
  }

  if (!input.address.trim()) {
    throw new Error(
      "Please enter the full address."
    );
  }

  if (
    input.description.trim().length < 20
  ) {
    throw new Error(
      "Please provide a business description of at least 20 characters."
    );
  }

  if (
    !input.phones[0]?.number.trim()
  ) {
    throw new Error(
      "Please enter a business phone number."
    );
  }

  const invalidImage =
    input.images.find(
      (image) =>
        !/^https:\/\//i.test(
          image.trim()
        )
    );

  if (invalidImage) {
    throw new Error(
      "Business image links must begin with https://"
    );
  }

  await updateDoc(
    businessReference,
    {
      pendingUpdate:
        preparePendingUpdate(input),

      updateApprovalStatus:
        "pending",

      updateRejectionReason: "",

      updatedAt: serverTimestamp(),
    }
  );
}

export async function approveOwnerBusinessUpdate(
  businessId: string
): Promise<void> {
  if (!firebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured."
    );
  }

  const firestoreDb = db;

  const businessReference = doc(
    firestoreDb,
    collectionName,
    businessId
  );

  const snapshot = await getDoc(
    businessReference
  );

  if (!snapshot.exists()) {
    throw new Error(
      "Business listing not found."
    );
  }

  const business = {
    id: snapshot.id,
    ...snapshot.data(),
  } as Business;

  if (!business.pendingUpdate) {
    throw new Error(
      "No pending business update was found."
    );
  }

  const approvedFields =
    getApprovedUpdateFields(
      business.pendingUpdate
    );

  await updateDoc(
    businessReference,
    {
      ...approvedFields,

      pendingUpdate:
        deleteField(),

      updateApprovalStatus:
        deleteField(),

      updateRejectionReason:
        deleteField(),

      updatedAt: serverTimestamp(),
    }
  );
}

export async function rejectOwnerBusinessUpdate(
  businessId: string,
  rejectionReason: string
): Promise<void> {
  if (!firebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured."
    );
  }

  const reason =
    rejectionReason.trim();

  if (!reason) {
    throw new Error(
      "Please provide a rejection reason."
    );
  }

  const firestoreDb = db;

  const businessReference = doc(
    firestoreDb,
    collectionName,
    businessId
  );

  const snapshot = await getDoc(
    businessReference
  );

  if (!snapshot.exists()) {
    throw new Error(
      "Business listing not found."
    );
  }

  const business = {
    id: snapshot.id,
    ...snapshot.data(),
  } as Business;

  if (!business.pendingUpdate) {
    throw new Error(
      "No pending business update was found."
    );
  }

  await updateDoc(
    businessReference,
    {
      updateApprovalStatus:
        "rejected",

      updateRejectionReason:
        reason,

      updatedAt: serverTimestamp(),
    }
  );
}

export async function updateBusinessApproval(
  businessId: string,
  approvalStatus: BusinessApprovalStatus,
  rejectionReason = ""
): Promise<void> {
  if (!firebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured."
    );
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

  const firestoreDb = db;

  await updateDoc(
    doc(
      firestoreDb,
      collectionName,
      businessId
    ),
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
    throw new Error(
      "Firebase is not configured."
    );
  }

  const firestoreDb = db;

  await deleteDoc(
    doc(
      firestoreDb,
      collectionName,
      id
    )
  );
}
