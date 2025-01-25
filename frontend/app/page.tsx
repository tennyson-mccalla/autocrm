'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function HomePage() {
  const cookieStore = cookies();
  const hasSession = cookieStore.has('supabase-auth-token');

  if (!hasSession) {
    return redirect('/login');
  }

  return redirect('/tickets');
}
