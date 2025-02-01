import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('🔥 Middleware: Processing request', req.url);

  try {
    const res = NextResponse.next();

    // Get the auth cookie
    const authCookie = req.cookies.get('sb-localhost-auth-token');
    console.log('🔥 Middleware: Auth cookie exists:', !!authCookie);

    // Parse the token if it exists
    let token = null;
    if (authCookie) {
      try {
        const cookieArray = JSON.parse(authCookie.value);
        token = cookieArray[0];
        console.log('🔥 Middleware: Token parsed successfully');
      } catch (e) {
        console.error('🔥 Middleware: Error parsing token:', e);
      }
    }

    console.log('🔥 Middleware: Creating Supabase client');
    const supabase = createMiddlewareClient({
      req,
      res,
    });

    console.log('🔥 Middleware: Getting session');
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('🔥 Middleware: Session result:', {
      hasSession: !!session,
      sessionError: error,
      userId: session?.user?.id,
      metadata: session?.user?.user_metadata
    });

    return res;
  } catch (error) {
    console.error('🔥 Middleware: Error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
