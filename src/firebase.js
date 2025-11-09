// Lightweight firebase helper with fallback to sample questions
// To enable Firestore: replace the config below with your Firebase project's config
// and uncomment initialization lines.

// import { initializeApp } from 'firebase/app'
// import { getFirestore, collection, getDocs } from 'firebase/firestore'

const sampleQuestions = Array.from({ length: 30 }).map((_, i) => ({
  id: `q${i + 1}`,
  question: `Question ${i + 1}: What is ${i + 1} + ${i + 2}?`,
  options: [String(i + 1), String(i + 2), String(i + i + 2), String(i + 3)],
  correct: 2,
}));

export async function fetchQuestions(section = "quant") {
  // If firebase config is provided, you can implement Firestore fetch here.
  // Example (uncomment and configure above):
  // const firebaseConfig = { apiKey: '...', authDomain: '...', projectId: '...' }
  // const app = initializeApp(firebaseConfig)
  // const db = getFirestore(app)
  // const qSnap = await getDocs(collection(db, `questions/${section}`))
  // return qSnap.docs.map(d => d.data())

  // fallback
  return new Promise((resolve) =>
    setTimeout(() => resolve(sampleQuestions), 250)
  );
}

// Placeholder attempt saving; replace with Firestore writes if configured
export async function saveAttempt(userId, summary) {
  // Example Firestore write (pseudo):
  // const docRef = doc(collection(db, `users/${userId}/attempts`))
  // await setDoc(docRef, { ...summary, createdAt: serverTimestamp() })
  try {
    console.debug("Attempt saved (mock):", { userId, summary });
  } catch (e) {
    console.error("Attempt save failed (mock)", e);
  }
}
