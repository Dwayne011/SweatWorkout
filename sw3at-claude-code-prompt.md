# SW3AT Workouts — Performance Fix + M3 Expressive Reskin

## Context

This is a React 19 + TypeScript SPA bundled with Vite, styled with Tailwind CSS v4, animated with Framer Motion, icons from lucide-react. Backend is Node/Express + Google Gemini. Shipped to Android via Capacitor 8 with a custom Java foreground-service plugin for the workout timer notification.

The app currently ships as a **single 1.4 MB JS bundle** with zero code splitting. It has performance issues (jitter, slow transitions) especially on Android WebView.

## Phase 1: Performance Fixes (do these first)

### 1A. Code-split by tab view

The app has 5 main views: Workout, History, Routines, Library, Login/Settings. Each should be lazy-loaded.

```tsx
// Example pattern — apply to each tab's main component
const Library = React.lazy(() => import('./Library'));
const History = React.lazy(() => import('./History'));
const Routines = React.lazy(() => import('./Routines'));
const ActiveWorkout = React.lazy(() => import('./ActiveWorkout'));
const Login = React.lazy(() => import('./Login'));

// Wrap in Suspense with a minimal loading skeleton
<Suspense fallback={<TabSkeleton />}>
  {activeTab === 'library' && <Library />}
</Suspense>
```

Also check if `googleSheetsService` is already split (it appears to be based on the Vite output `googleSheetsService-DPODi1Wb.js`) — if so, good, leave it. If not, make it a dynamic import since it's only needed when the user explicitly syncs.

### 1B. Fix localStorage thrashing

The app reads these keys frequently — some likely inside render paths or useEffect dependency chains:

- `workout_tracker_active_workout` (probably written on every set/rep update)
- `workout_tracker_history`
- `workout_tracker_custom_exercises`
- `workout_tracker_templates`
- `workout_tracker_exercise_notes`
- `sw3at_user_profile`
- `sw3at_next_session_recommendations`

**Fix:** Create a simple `useLocalStorage` hook or context that reads once on mount and writes on a debounced basis (e.g. 500ms for active workout). Never call `localStorage.getItem` inside a render path. Consider `useSyncExternalStore` for shared state that multiple components read.

### 1C. Reduce Framer Motion layout thrash

The bundle contains 23 `layoutId` instances and `AnimatePresence` wrappers. On Android WebView, each `layoutId` triggers a synchronous FLIP measurement.

**Actions:**
- Audit every `layoutId` — remove any that aren't producing a visible cross-fade between views. Most tab transitions don't need layout animation; a simple opacity/translateY is cheaper.
- Replace `AnimatePresence` + `layoutId` on tab switches with CSS `opacity` + `transform` transitions or `view-transition-name` if the WebView supports it.
- Keep `AnimatePresence` only where exit animations are genuinely needed (modals, toasts, the discard dialog).
- For exercise list items, replace `layout` prop with `layout="position"` to skip size measurements, or remove it entirely if items don't reorder.
- Cap `whileDrag` usage — 37 drag-enabled elements is excessive. Only the exercise reorder list and the rest timer slider genuinely need drag.

### 1D. Cap blur radii for Android

The CSS uses blur values up to 140px. On Android WebView these are GPU-expensive.

**In your Tailwind config or CSS custom properties, add a media query or class-based override for the Capacitor build:**

```css
/* In your global CSS or Tailwind @layer base */
.capacitor-android .gemini-bg-glow-1,
.capacitor-android .gemini-bg-glow-2,
.capacitor-android [class*="blur-[130"],
.capacitor-android [class*="blur-[140"],
.capacitor-android [class*="blur-[90"],
.capacitor-android [class*="blur-[80"] {
  filter: blur(32px) !important;
}
.capacitor-android [class*="backdrop-blur-3xl"],
.capacitor-android [class*="backdrop-blur-2xl"] {
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
}
```

Capacitor sets a class or you can detect via `window.Capacitor?.getPlatform() === 'android'` and toggle a body class on mount.

### 1E. Disable heavy background animations on Android

The `gemini-bg-glow-1` and `gemini-bg-glow-2` keyframe animations run a 15s/20s infinite loop with scale + rotate + translate on blurred radial gradients. On Android WebView this is a constant GPU compositor cost.

**Fix:** Either disable these entirely on Android, or replace with a static positioned gradient that doesn't animate.

---

## Phase 2: M3 Expressive Design Token Swap

The app already has a CSS custom properties system with `--bg-main`, `--text-main`, `--panel-bg`, `--glow-color`, etc., plus a `.dark` class toggle. The M3 Expressive reskin is primarily a token replacement.

### New token values (dark mode — the primary mode)

Replace the existing `.dark { ... }` block with these values:

```css
.dark {
  /* surfaces */
  --bg-main: #0b0910;
  --surface: #161220;
  --surface-low: #1d1828;
  --surface-container: #241e31;
  --surface-high: #2f273f;
  --surface-highest: #3a3149;

  /* text */
  --text-main: #ece5f6;
  --text-muted: #b6abc8;
  --text-dim: #8a8099;

  /* borders / outlines */
  --panel-border: rgba(147, 51, 234, 0.25);  /* keep purple glow but toned */
  --outline: #564d66;
  --outline-quiet: #372f47;

  /* primary (violet) */
  --primary: #b69cff;
  --primary-fill: #7b53f6;
  --primary-container: #3a2580;
  --on-primary-container: #e8ddff;

  /* accent (lime — reserved for THE key action per screen) */
  --accent: #caf24e;
  --on-accent: #222f00;

  /* semantic */
  --success: #27d488;
  --on-success: #00321d;
  --error: #ff6b80;
  --on-error: #48121d;

  /* glass / backdrop (existing pattern, adjusted) */
  --glass-bg: rgba(22, 18, 32, 0.85);
  --glass-border: rgba(147, 51, 234, 0.25);
  --btn-bg: rgba(147, 51, 234, 0.08);
  --btn-hover: rgba(147, 51, 234, 0.2);
  --glow-color: rgba(147, 51, 234, 0.5);
}
```

### Updated border radii

M3 Expressive uses larger, rounder shapes. Update the Tailwind theme:

```css
:root {
  --radius-md: 0.75rem;   /* was 0.375rem */
  --radius-lg: 1rem;      /* was 0.5rem */
  --radius-xl: 1.25rem;   /* was 0.75rem */
  --radius-2xl: 1.375rem; /* was 1rem */
  --radius-3xl: 1.75rem;  /* was 1.5rem */
}
```

Buttons should use `rounded-full` (pill shape) as the default, not `rounded-xl`.

### Typography

The app already uses Outfit (display) + Inter (body) + JetBrains Mono (mono). These are fine — keep them. The M3 Expressive change is about weight, not face:
- Headlines: bump to `font-black` (900) with `tracking-tight`
- Body: keep `font-normal` (400)
- Labels/eyebrows: `font-bold` (700) + `tracking-wider` + `uppercase` via JetBrains Mono

---

## Phase 3: Component Reskin (incremental, screen by screen)

Build these shared components, then swap them in one screen at a time:

### 3A. `<PillButton>` — the primary interactive element

```tsx
// Variants: fill, tonal, accent, outline, error, success
// All use rounded-full, py-4 px-6, font-extrabold, flex items-center gap-3
// The "accent" variant uses the lime --accent colour and should be used for
// exactly ONE primary CTA per screen (the M3 research finding)
```

### 3B. `<TonalCard>` — replaces current card/panel pattern

```tsx
// Uses --surface-container background, rounded-[1.75rem], p-5
// Has an optional "elevated" prop that bumps to --surface-high
```

### 3C. `<BlobIcon>` — the organic shape icon container

```tsx
// An SVG "cookie" blob shape behind an icon
// Used for hero/empty-state illustrations
// Takes a colour prop (primary, error, success) that tints the blob path
```

### 3D. `<FloatingNav>` — replaces the bottom tab bar

```tsx
// fixed bottom, glass background, rounded-[30px], mx-3 mb-4
// Active tab shows a filled pill behind the icon (--primary-fill background)
// Labels in mono uppercase, 9-10px
```

### 3E. `<SegmentedGroup>` — connected button group

```tsx
// Used for: Export/Import, Light/Dark toggle, Discard/Pause/Continue
// Container: --surface-high background, rounded-full, p-1 gap-1
// Each segment: rounded-full, transparent default, --primary-fill when selected
```

### 3F. `<WavyIndicator>` — live session decoration

```tsx
// An SVG sine wave with stroke-dasharray animation
// Used in the active workout session header
// Colour: --primary, animates with stroke-dashoffset
// Respect prefers-reduced-motion
```

### Screen rollout order

1. **Routines** — most distinct cards, good test of TonalCard + PillButton + BlobIcon
2. **Library** — exercise list rows, search bar, chip filters
3. **Active Session** — session header with WavyIndicator, Discard/Finish buttons
4. **Workout Home** — cloud backup card, start session card
5. **History** — empty state with BlobIcon, segmented tabs
6. **Login/Account** — profile card, theme toggle with SegmentedGroup
7. **Discard Modal** — dialog with BlobIcon + SegmentedGroup

---

## Reference

The complete M3 Expressive mockup of all 7 screens as static HTML is at:
`sw3at-m3-expressive.html` (should be in the project root or downloads — it contains the exact CSS tokens, component patterns, and icon SVGs to reference during implementation).

## Key design rules from M3 Expressive research

- **One accent-colour CTA per screen** — the lime button should be the single most important action. Everything else uses primary-fill (violet) or tonal.
- **Text labels on everything** — removing labels hurts usability. Keep icon + text on nav items and buttons.
- **Don't break familiar patterns** — the exercise list stays a vertical scroll list, not a grid. Tabs stay as tabs.
- **Larger tap targets** — buttons should be min 48px height, ideally 56px for primary actions.
- **Respect reduced motion** — all new animations behind `prefers-reduced-motion`.
