/* OttomanLabs.AI — cloud save configuration.
 *
 * Paste your Firebase web-app config below to switch on sign-in + saving.
 *
 * IMPORTANT: a Firebase *web* config (apiKey, projectId, …) is PUBLIC by
 * design — it is safe to commit to the repo. Access is enforced by the
 * Firestore security rules (see firestore.rules), NOT by keeping these
 * values secret. Nothing here is a credential.
 *
 * Until you replace `null` with your config object, the cloud feature stays
 * completely dormant: no button, no network calls, the site is unchanged.
 *
 * Setup steps are in docs/CLOUD-SETUP.md.
 */
window.OL_FIREBASE = null;

/* Example, once you have created the Firebase project and a Web app:

window.OL_FIREBASE = {
  apiKey: "AIzaSy…",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:abcdef123456"
};

*/
