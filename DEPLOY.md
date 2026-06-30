# Deploying the Project PB backend (Cloud Run)

The Express server (`server.ts`) does three jobs: it proxies Gemini with the
**server-side** key, verifies Firebase ID tokens on every `/api/ai/*` call, and
serves the built web app. The Gemini key never reaches the client — only the
server reads `process.env.GEMINI_API_KEY`. This guide deploys it to Cloud Run.

> The web app is served by this backend (same origin), so its API calls use
> relative paths. The **native Android app** is served from `file://`, so it
> must be built with `VITE_API_BASE_URL` pointing at the deployed URL — see the
> last section.

## Prerequisites

- `gcloud` CLI installed and authenticated: `gcloud auth login`
- A project selected: `gcloud config set project <PROJECT_ID>`
- APIs enabled (once): `gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com`

## 1. Store the Gemini key as a secret (never an env var in plain text)

```bash
printf '%s' 'YOUR_REAL_GEMINI_KEY' | gcloud secrets create gemini-api-key --data-file=-
# to rotate later:
printf '%s' 'NEW_KEY' | gcloud secrets versions add gemini-api-key --data-file=-
```

Grant the Cloud Run runtime service account access (once):

```bash
PROJECT_NUMBER=$(gcloud projects describe "$(gcloud config get-value project)" --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## 2. Deploy

`--source .` builds the included `Dockerfile` with Cloud Build, then deploys it.

```bash
gcloud run deploy projectpb \
  --source . \
  --region europe-west2 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --set-env-vars NODE_ENV=production,GEMINI_MODEL=gemini-flash-lite-latest,FIREBASE_PROJECT_ID=<YOUR_FIREBASE_PROJECT_ID>
```

- `FIREBASE_PROJECT_ID` must be your real Firebase project id — the server uses
  it to verify ID tokens (firebase-admin). It currently falls back to a hardcoded
  id in `server.ts`; set it explicitly here.
- `--allow-unauthenticated` lets the app reach it; the app's own Firebase token
  check is the real auth gate.

The command prints the service URL, e.g. `https://projectpb-xxxx.europe-west2.run.app`.

## 3. Verify

```bash
curl -s https://<SERVICE_URL>/api/ai/coach -X POST -H 'content-type: application/json' -d '{}'
# Expect JSON (a 401 "missing token" is correct — it means auth is wired and the
# server returns JSON, not the "Unexpected token <doctype" HTML error).
```

## 4. Point the native app at the deployed backend

On your build machine, set the base URL and rebuild the Android app. This is the
fix for the `Unexpected token '<', "<!doctype"...` error — without it the WebView
calls its own `file://` origin and gets `index.html` back instead of JSON.

```bash
# .env on the build machine (gitignored), or inline:
VITE_API_BASE_URL=https://<SERVICE_URL> npx vite build
npx cap sync android
# then the usual Bash gradle build + adb install
```

The web build (served by the backend) leaves `VITE_API_BASE_URL` empty — relative
`/api` paths resolve to the same origin.
