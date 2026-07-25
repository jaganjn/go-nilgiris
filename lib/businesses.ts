import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { businessAliases, seedBusinesses } from "@/data/seedBusinesses";
import { db, firebaseConfigured } from "@/lib/firebase";
import type { Business, BusinessInput } from "@/types/business";

const collectionName = "businesses";

export async function listBusinesses(): Promise<Business[]> {
  if (!firebaseConfigured || !db) return seedBusinesses;
  try {
    const snapshot = await getDocs(query(collection(db, collectionName), orderBy("name")));
    if (snapshot.empty) return seedBusinesses;
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Business);
  } catch {
    return seedBusinesses;
  }
}

export async function getBusiness(id: string): Promise<Business | null> {
  const canonicalId = businessAliases[id] ?? id;
  if (!firebaseConfigured || !db) return seedBusinesses.find((item) => item.id === canonicalId) ?? null;
  try {
    const snapshot = await getDoc(doc(db, collectionName, canonicalId));
    if (snapshot.exists()) return { id: snapshot.id, ...snapshot.data() } as Business;
  } catch {
    // Fall through to the bundled seed data.
  }
  return seedBusinesses.find((item) => item.id === canonicalId) ?? null;
}

export async function saveBusiness(input: BusinessInput): Promise<string> {
  if (!db) throw new Error("Firebase is not configured.");
  const payload = { ...input, updatedAt: serverTimestamp() };
  if (input.id) {
    await setDoc(doc(db, collectionName, input.id), { ...payload, createdAt: serverTimestamp() }, { merge: true });
    return input.id;
  }
  const created = await addDoc(collection(db, collectionName), { ...payload, createdAt: serverTimestamp() });
  await updateDoc(created, { id: created.id });
  return created.id;
}

export async function removeBusiness(id: string) {
  if (!db) throw new Error("Firebase is not configured.");
  await deleteDoc(doc(db, collectionName, id));
}
