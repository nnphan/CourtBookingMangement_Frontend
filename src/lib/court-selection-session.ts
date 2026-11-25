import { http } from '@/lib/axios';
import type { ApiEnvelope } from '@/types/api';

const SESSION_KEY = 'courtBooking.ownerSessionId';
const GUEST_KEY = 'courtBooking.guestSelection';
type GuestCredential = { token: string; expiresAt: string; sessionId: string };

function getCourtSelectionSessionId() {
  let session = sessionStorage.getItem(SESSION_KEY);
  if (!session) {
    session = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, session);
  }
  return session;
}

let reservedSession: Promise<string> | undefined;

export function reserveCourtSelectionSession(): Promise<string> {
  if (reservedSession) return reservedSession;
  const session = getCourtSelectionSessionId();
  if (!navigator.locks) return Promise.resolve(session);

  // A duplicated tab can start with a copy of sessionStorage.
  reservedSession = new Promise((resolve) => {
    function reserve(candidate: string) {
      void navigator.locks
        .request(`court-selection:${candidate}`, { ifAvailable: true }, (lock) => {
          if (!lock) {
            const replacement = crypto.randomUUID();
            sessionStorage.setItem(SESSION_KEY, replacement);
            sessionStorage.removeItem(GUEST_KEY);
            reserve(replacement);
            return;
          }
          resolve(candidate);
          // Keep the lease for this document. The browser releases it on navigation.
          return new Promise<void>(() => undefined);
        })
        .catch(() => resolve(candidate));
    }
    reserve(session);
  });
  return reservedSession;
}

function readGuestCredential(sessionId: string | undefined) {
  if (!sessionId) return undefined;
  const stored = sessionStorage.getItem(GUEST_KEY);
  if (!stored) return undefined;
  try {
    const credential = JSON.parse(stored) as GuestCredential;
    if (
      credential.sessionId === sessionId &&
      typeof credential.token === 'string' &&
      credential.token.trim() &&
      Date.parse(credential.expiresAt) > Date.now()
    )
      return credential;
  } catch {
    sessionStorage.removeItem(GUEST_KEY);
  }
}

export async function ensureCourtSelectionGuest(sessionId: string) {
  const existing = readGuestCredential(sessionId);
  if (existing && Date.parse(existing.expiresAt) - Date.now() > 10 * 60_000)
    return existing.expiresAt;
  const { data } = await http.post<ApiEnvelope<Omit<GuestCredential, 'sessionId'>>>(
    '/court-selections/guest-session',
    null,
    { params: { ownerSessionId: sessionId } },
  );
  if (
    typeof data.data?.token !== 'string' ||
    !data.data.token.trim() ||
    !(Date.parse(data.data.expiresAt) > Date.now())
  ) {
    throw new Error('Invalid court selection guest credential.');
  }
  sessionStorage.setItem(GUEST_KEY, JSON.stringify({ ...data.data, sessionId }));
  return data.data.expiresAt;
}

export function courtSelectionGuestHeaders(sessionId: string | undefined) {
  const credential = readGuestCredential(sessionId);
  return credential ? { 'X-Court-Selection-Guest': credential.token } : {};
}
