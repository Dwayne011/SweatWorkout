# Native Google sign-in setup

`signInWithPopup` (the Firebase web SDK popup) cannot run inside the Android
WebView, so on the phone the app uses the `@capacitor-firebase/authentication`
plugin to run Google's native sign-in, then signs the Firebase JS SDK in with the
returned credential (so the backend token check + Sheets sync keep working).

**The code is already wired** — `App.tsx` `handleGoogleLogin` (platform-conditional),
`capacitor.config.ts` (`FirebaseAuthentication`, `skipNativeAuth`), the installed
plugin, and the Android gradle (`app/build.gradle` already applies the
google-services plugin *only when `google-services.json` is present*, so the build
stays green until you add it). You just need the Firebase-side credentials below.
Web sign-in already works; native sign-in shows a friendly error until this is done.

## 1. Register the Android app in Firebase

- Firebase console → your project → **Add app → Android**.
- Android package name: `com.projectpb.workouts` (must match exactly).
- Download **`google-services.json`** and place it at **`android/app/google-services.json`**.

## 2. Add SHA fingerprints

Google sign-in is gated on the app's signing-certificate fingerprints.

Debug keystore (for `assembleDebug` / local testing):

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

- Copy the **SHA-1** and **SHA-256** lines.
- Firebase console → Project settings → your Android app → **Add fingerprint** (add both).
- **Re-download `google-services.json`** after adding them — it embeds the OAuth client used for native Google sign-in.
- For a Play release build, also add the **release** keystore's SHA-1/SHA-256 and the **Play App Signing** SHA-256 from the Play Console.

## 3. Enable the Google provider

- Firebase console → **Authentication → Sign-in method** → enable **Google**.

## 4. Sync and build

```bash
npx vite build
npx cap sync android
# Bash, per the build chain (PowerShell gradlew silently no-ops):
cd android && export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr" \
  && export ANDROID_HOME="$HOME/AppData/Local/Android/Sdk" \
  && ./gradlew assembleDebug --console=plain
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Tap **Sync with Google / Log in with Google** in the app — the native Google
account picker should appear, and on success `auth.currentUser` is populated and
the Sheets access token is stored.

## Notes

- `skipNativeAuth: true` keeps the Firebase **JS SDK** as the source of truth; the
  plugin only runs the Google flow and hands back the credential.
- The web-only issues (`auth/unauthorized-domain`, OAuth test users, third-party
  cookies) do **not** apply to native sign-in — they're popup concerns.
- The Sheets scope (`.../auth/spreadsheets`) is requested in `handleGoogleLogin`;
  the returned access token feeds `googleSheetsService`.
- `google-services.json` contains no secret you must hide from the repo, but it's
  environment-specific — keep it out of source control if you have multiple
  Firebase projects (it's currently not gitignored; add it if needed).
