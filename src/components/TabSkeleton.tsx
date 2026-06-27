/**
 * Minimal Suspense fallback shown while a lazily-loaded tab view's chunk
 * downloads. Kept intentionally tiny so it isn't part of the heavy chunks.
 */
export default function TabSkeleton() {
  return (
    <div className="flex items-center justify-center py-24" aria-busy="true" aria-live="polite">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500/25 border-t-indigo-500 animate-spin" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
