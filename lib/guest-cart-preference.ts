const GUEST_ACK_KEY = 'dubicolt_guest_cart_ack';
const LEGACY_GUEST_ACK_KEY = 'dubiken_guest_cart_ack';

export function hasGuestCartAck(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (sessionStorage.getItem(GUEST_ACK_KEY) === '1') return true;
    if (sessionStorage.getItem(LEGACY_GUEST_ACK_KEY) === '1') {
      sessionStorage.setItem(GUEST_ACK_KEY, '1');
      sessionStorage.removeItem(LEGACY_GUEST_ACK_KEY);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function setGuestCartAck(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(GUEST_ACK_KEY, '1');
  } catch {
    /* ignore */
  }
}
