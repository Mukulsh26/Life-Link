let messagingInstance = null;

export function getFirebaseMessaging() {
  if (typeof window === "undefined") return null; // SSR safety

  if (messagingInstance) return messagingInstance;

  const { initializeApp } = require("firebase/app");
  const { getMessaging } = require("firebase/messaging");

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  messagingInstance = getMessaging(app);

  return messagingInstance;
}

export async function requestFcmToken() {
  if (typeof window === "undefined") return null; // SSR guard

  try {
    const { getToken } = require("firebase/messaging");

    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
    });

    if (token) {
      console.log("FCM token:", token);
      localStorage.setItem("lifelink_fcm_token", token);
      return token;
    } else {
      console.warn("No FCM token retrieved.");
      return null;
    }
  } catch (err) {
    console.error("FCM error:", err);
    return null;
  }
}
