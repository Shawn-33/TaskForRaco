'use client';

import { ReactNode } from 'react';
import { StripeProvider } from '@/components/StripeProvider';

export function Providers({ children }: { children: ReactNode }) {
  return <StripeProvider>{children}</StripeProvider>;
}
