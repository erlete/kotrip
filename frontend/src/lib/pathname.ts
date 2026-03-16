'use server';

import { headers } from 'next/headers';

export async function getPathname() {
  const headersList = await headers();
  const candidate =
    headersList.get('x-next-url') ||
    headersList.get('x-url') ||
    headersList.get('x-invoke-path') ||
    headersList.get('referer');

  if (!candidate) return undefined;

  if (candidate.startsWith('/')) return candidate;

  try {
    const url = new URL(candidate);
    return url.pathname;
  } catch {
    return undefined;
  }
}
