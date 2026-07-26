import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  db,
  firebaseConfigured,
} from "@/lib/firebase";

import type {
  Enquiry,
  EnquiryInput,
  EnquiryStatus,
} from "@/types/enquiry";

const collectionName = "enquiries";

function mapEnquiry(
  enquiryDocument: {
    id: string;
    data: () => unknown;
  }
): Enquiry {
  return {
    id: enquiryDocument.id,
    ...(enquiryDocument.data() as Omit<
      Enquiry,
      "id"
    >),
  };
}

function getTimestampMilliseconds(
  value: unknown
): number {
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

export async function createEnquiry(
  input: EnquiryInput
): Promise<string> {
  if (!firebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured."
    );
  }

  const enquiry = await addDoc(
    collection(db, collectionName),
    {
      businessId: input.businessId,
      businessName:
        input.businessName.trim(),
      customerName:
        input.customerName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || "",
      serviceDate: input.serviceDate || "",
      message: input.message.trim(),
      status: "new",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return enquiry.id;
}

export async function listEnquiries(): Promise<
  Enquiry[]
> {
  if (!firebaseConfigured || !db) {
    return [];
  }

  const enquiryQuery = query(
    collection(db, collectionName),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(
    enquiryQuery
  );

  return snapshot.docs.map(mapEnquiry);
}

export async function listOwnerEnquiries(
  businessIds: string[]
): Promise<Enquiry[]> {
  if (
    !firebaseConfigured ||
    !db ||
    businessIds.length === 0
  ) {
    return [];
  }

  const firestoreDb = db;

  const uniqueBusinessIds = Array.from(
    new Set(
      businessIds
        .map((businessId) =>
          businessId.trim()
        )
        .filter(Boolean)
    )
  );

  const snapshots = await Promise.all(
    uniqueBusinessIds.map(
      async (businessId) => {
        const ownerEnquiryQuery = query(
          collection(
            firestoreDb,
            collectionName
          ),
          where(
            "businessId",
            "==",
            businessId
          )
        );

        return getDocs(
          ownerEnquiryQuery
        );
      }
    )
  );

  const enquiries = snapshots.flatMap(
    (snapshot) =>
      snapshot.docs.map(mapEnquiry)
  );

  return enquiries.sort(
    (first, second) =>
      getTimestampMilliseconds(
        second.createdAt
      ) -
      getTimestampMilliseconds(
        first.createdAt
      )
  );
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<void> {
  if (!firebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured."
    );
  }

  if (
    status !== "new" &&
    status !== "contacted" &&
    status !== "closed"
  ) {
    throw new Error(
      "Invalid enquiry status."
    );
  }

  await updateDoc(
    doc(db, collectionName, id),
    {
      status,
      updatedAt: serverTimestamp(),
    }
  );
}
