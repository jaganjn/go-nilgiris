import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db, firebaseConfigured } from "@/lib/firebase";
import type {
  Enquiry,
  EnquiryInput,
  EnquiryStatus,
} from "@/types/enquiry";

const collectionName = "enquiries";

export async function createEnquiry(
  input: EnquiryInput
): Promise<string> {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  const enquiry = await addDoc(
    collection(db, collectionName),
    {
      businessId: input.businessId,
      businessName: input.businessName.trim(),
      customerName: input.customerName.trim(),
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

export async function listEnquiries(): Promise<Enquiry[]> {
  if (!firebaseConfigured || !db) {
    return [];
  }

  const enquiryQuery = query(
    collection(db, collectionName),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(enquiryQuery);

  return snapshot.docs.map(
    (item) =>
      ({
        id: item.id,
        ...item.data(),
      }) as Enquiry
  );
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<void> {
  if (!firebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  await updateDoc(doc(db, collectionName, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}
