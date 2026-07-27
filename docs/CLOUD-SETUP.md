# Cloud save — Firebase setup

This turns on the **Cloud** button in the dashboards, so signed-in users can
keep many named files per account. Sign-in is by **email + password** or a
**passwordless email link**. Storage is **Firestore**.

Until you finish step 6, the feature stays completely dormant — no button, no
network calls, the live site is unchanged.

Everything is free on Firebase's Spark (no-card) plan for this kind of use.

---

## 1. Create a Firebase project
1. Go to <https://console.firebase.google.com> → **Add project**.
2. Name it (e.g. `ottomanlabs`), accept defaults. Google Analytics is optional.

## 2. Add a Web app and copy the config
1. In the project, click the **`</>`** (Web) icon → register an app
   (nickname `ottomanlabs-web`). You do **not** need Firebase Hosting.
2. Firebase shows a `firebaseConfig = { apiKey: …, authDomain: …, projectId: … }`
   object. Copy it — you'll paste it in step 6.
   > This web config is **public by design** and safe to commit. Access is
   > enforced by the security rules below, not by hiding these values.

## 3. Turn on the sign-in methods
1. **Build → Authentication → Get started**.
2. **Sign-in method** tab → enable **Email/Password**.
3. On that same Email/Password provider, also switch on
   **Email link (passwordless sign-in)**. Save.

## 4. Authorise your domain
1. **Authentication → Settings → Authorized domains**.
2. Add `ottomanlabs.ai` (and `www.ottomanlabs.ai` if you use it).
   `localhost` is there by default for local testing.
   > Miss this and sign-in fails with "unauthorised domain".

## 5. Create the database and paste the rules
1. **Build → Firestore Database → Create database** → **Production mode** →
   pick a location near you.
2. Open the **Rules** tab, replace everything with the contents of
   [`firestore.rules`](../firestore.rules), and press **Publish**.
   These rules let each user read/write only their own `users/{uid}/…` tree.

## 6. Paste the config into the site
Edit [`assets/firebase-config.js`](../assets/firebase-config.js) and replace
`window.OL_FIREBASE = null;` with your config from step 2, e.g.

```js
window.OL_FIREBASE = {
  apiKey: "AIzaSy…",
  authDomain: "ottomanlabs.firebaseapp.com",
  projectId: "ottomanlabs",
  storageBucket: "ottomanlabs.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:abcdef123456"
};
```

Commit and deploy. A **Cloud** button now appears on the wired dashboards.

---

## How it works
- Files live at `users/{uid}/tools/{tool}/files/{fileId}` —
  `{ name, data, createdAt, updatedAt }`. Each dashboard has its own drawer
  (its `tool` id), so a user's Gherkin files and Studio files stay separate.
- The Firebase SDK is loaded from Google's CDN only when the user opens the
  panel (or returns from a sign-in link), so pages stay fast and keep working
  if Firebase is unreachable.
- Nothing secret is stored in the repo. The only editable value is the public
  web config in `firebase-config.js`.

## Adding save/load to another dashboard
Before the two cloud `<script>` tags, define an adapter:

```html
<script>
  window.OLCloudAdapter = {
    tool: 'dymak',                 // stable, unique id → its own file drawer
    label: 'Dymak HQ',             // shown in the panel
    getState: function(){ return /* a JSON-serialisable document */; },
    setState: function(s){ /* apply a loaded document */ }
  };
</script>
<script src="assets/firebase-config.js"></script>
<script src="assets/ol-cloud.js" defer></script>
```

Reuse the page's existing export/import functions for `getState`/`setState`,
and add the tool to the `TOOLS` registry at the top of `assets/ol-cloud.js` so
it appears as a folder in the explorer.

Currently wired with save/load: **The Gherkin**, **Gherkin Studio**,
**Dymak HQ**, **CV Builder** and **pyBuffet** (its document is the watchlist).
Every other page carries the Cloud button too — sign-in plus the file
explorer — so files are reachable from anywhere; opening a file that belongs
to another dashboard navigates there (`?olfile=<id>`) and loads it on arrival.
The Playground has no single savable document yet, so it shows the explorer
only.
