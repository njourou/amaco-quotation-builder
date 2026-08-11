/**
 * Per-visitor chat memory: a stable session id stored in localStorage so each
 * visitor keeps their own Amani conversation across page reloads.
 *
 * Runs client-side only (module is imported from "use client" components).
 */

const STORAGE_KEY = "amani_session_id";

function generateSessionId(): string {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  return `visitor-${random}`;
}

/** Get (and lazily create) the visitor's stable session id. */
export function getAmaniSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateSessionId();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // localStorage unavailable (private mode / blocked) — fall back to
    // content-keyed memory on the server; nothing fatal.
    return null;
  }
}
