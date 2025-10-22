"use server";

import { db } from "@/server/firebaseAdmin";
import { error } from "console";

export async function addDoc(payload: any) {
  if (!payload) return null;

  const result = {
    ...payload,
    createdAt: new Date(),
    status: "draft",
  };

  try {
    // Add the document to Firestore
    const newDocRef = await db.collection("permits").add(result);

    // newDocRef.id is the Firestore-generated document ID
    return {
      id: newDocRef.id,
      
      ...result, // optional: return the data you stored
    };
  } catch (err) {
    console.error("Failed to add document:", err);
    throw err;
  }
}

export async function getTruckInfo(draftId: string) {
  if (!draftId) throw new Error("Missing draftId");

  try {
    const docRef = db.collection("permits").doc(draftId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error("Document not found");
    }

    const data = docSnap.data();

    return {
      id: docSnap.id,
      ...data?.step2,
    };
  } catch (error) {
    console.error("Failed to fetch truck info:", error);
    throw error;
  }
}


export async function addTruckInfo(draftId: string, payload: any) {
  if (!draftId || !payload) {
    throw new Error("Missing draftId or truckData");
  }

  try {
     const updatedAt = new Date();

  await db.collection("permits").doc(draftId).set(
    {
      step2: payload,
      updatedAt,
    },
    { merge: true }
  );

  // ✅ Return JSON-safe data
  return {
    id: draftId,
    updatedAt: updatedAt.toISOString(),
    ok: true,
  };
  } catch (err) {
    console.error("Failed to update truck info:", err);
    throw err;
  }
}

function serializeFirestoreData(data: any):any {
  if (!data || typeof data !== "object") return data;

  if (data._seconds !== undefined && data._nanoseconds !== undefined) {
    // Firestore Timestamp → JS Date string
    return new Date(data._seconds * 1000 + data._nanoseconds / 1e6).toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(serializeFirestoreData);
  }

  const result: Record<string, any> = {};
  for (const key in data) {
    result[key] = serializeFirestoreData(data[key]);
  }
  return result;
}


export async function getPermits() {
  try {
    const snapshot = await db.collection("permits")
    .limit(50)
    .orderBy("createdAt", "desc")
    .get();

    if (snapshot.empty) {
      console.log("No permits found");
      return [];
    }

    const permits = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...serializeFirestoreData(doc.data()),
    }));

    return permits;
  } catch (error) {
    console.error("Failed to fetch permits:", error);
    throw error;
  }
}
export async function addPermit(payload:any) {
  try {
    if (!payload) throw new Error('missing payload')
      await db.collection("permits").add(payload)
  } catch (error) {
    
  }
}
export async function savePermit(draftId:string, payload:any) {
  try {
    if (!payload) throw new Error('missing payload')
      await db.collection("permits").doc(draftId).set(payload)
    return {message: 'success'}
  } catch (error) {
    return {message: error}
  }
}
export async function getPermit(draftId:string) {
  try{
    const docRef = db.collection("permits").doc(draftId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error("Document not found");
    }

    const data = docSnap.data();

    return {
      id: docSnap.id,
      ...serializeFirestoreData(data),
    };
  }catch{

  }
} 
export async function paymentRequest(draftId:string){
    await db.collection('permits').doc(draftId).set({ readyToPay: true }, { merge: true })
}