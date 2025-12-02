importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCcmQtaZVW02QU2GJgROe1kqW55Bh0KH3E",
  authDomain: "life-link-53c5b.firebaseapp.com",
  projectId: "life-link-53c5b",
  storageBucket: "life-link-53c5b.firebasestorage.app",
  messagingSenderId: "589041252786",
  appId: "1:589041252786:web:928fd2f23d5651aacc8cab",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("📩 Received background message:", payload);

  const notificationTitle = payload.notification?.title || "Blood Request";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new blood request!",
    icon: "/icon.png",
    badge: "/icon.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
