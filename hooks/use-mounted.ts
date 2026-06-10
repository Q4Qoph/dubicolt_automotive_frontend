'use client';

import { useEffect, useState } from 'react';

/** True only after the first client paint — keeps SSR and hydration markup aligned */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
