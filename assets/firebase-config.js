/* OttomanLabs.AI — cloud save configuration.
 *
 * IMPORTANT: a Firebase *web* config (apiKey, projectId, …) is PUBLIC by
 * design — it is safe to commit to the repo. Access is enforced by the
 * Firestore security rules (see firestore.rules), NOT by keeping these
 * values secret. Nothing here is a credential.
 *
 * Setting this object switches on the Cloud button (sign-in + saving) on the
 * wired dashboards. Set it back to null to make the feature dormant again.
 *
 * Setup steps are in docs/CLOUD-SETUP.md.
 */
window.OL_FIREBASE = {
  apiKey: "AIzaSyDf5XAwmjwjnowe6N8JeRSuyHQaWGOriFE",
  authDomain: "ottomanlabsai-auth.firebaseapp.com",
  projectId: "ottomanlabsai-auth",
  storageBucket: "ottomanlabsai-auth.firebasestorage.app",
  messagingSenderId: "359555793201",
  appId: "1:359555793201:web:27a133fac12c40c74c7010",
  measurementId: "G-VML2SJSTGV"
};
