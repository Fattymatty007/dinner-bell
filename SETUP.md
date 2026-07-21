# Firebase setup for Dinner Bell sign-in

Dinner Bell uses Firebase Authentication (Google) + Firestore to let users sign
in and sync their dinner log and preferences across devices. Sign-in is
**optional** — the app works anonymously without it.

These steps must be done once in the [Firebase console](https://console.firebase.google.com);
they can't be automated from the repo.

## 1. Create the project

1. Firebase console → **Add project** → name it (e.g. `dinner-bell`).
2. Google Analytics is optional; you can skip it.

## 2. Register a Web app

1. In the project, click the **Web** icon (`</>`) to add a web app.
2. Give it a nickname; you don't need Firebase Hosting.
3. Copy the `firebaseConfig` object it shows you.
4. Paste those values into [`src/firebase.js`](src/firebase.js), replacing the
   `REPLACE_ME` placeholders. (The `apiKey` is not a secret — it only identifies
   the project; security is enforced by the rules and authorized domains below.)

## 3. Enable Google sign-in

1. **Authentication → Get started**.
2. **Sign-in method → Google → Enable** → set a support email → Save.

## 4. Authorize the app's domains

**Authentication → Settings → Authorized domains → Add domain**:

- `dinner-bell.mattsapps.xyz`

(`localhost` is already listed for local development.)

## 5. Create Firestore

1. **Firestore Database → Create database** → **Production mode** → pick a
   location → Enable.

## 6. Publish the security rules

**Firestore Database → Rules** → replace the contents with
[`firestore.rules`](firestore.rules) from this repo → **Publish**.

## Done

Once `src/firebase.js` has real values and the above is published, rebuild and
deploy. Sign in on `dinner-bell.mattsapps.xyz`, log a dinner, and refresh to
confirm it persisted.
