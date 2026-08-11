import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Returns true only when both Clerk keys look like real keys.
 * An empty string, blank placeholder, or scaffold fake returns false
 * — avoiding route protection when Clerk is not configured.
 */
function isClerkConfigured(): boolean {
  const pub = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
  const sec = process.env.CLERK_SECRET_KEY ?? '';
  const pubOk = (pub.startsWith('pk_test_') || pub.startsWith('pk_live_')) && pub.length > 40;
  const secOk = (sec.startsWith('sk_test_') || sec.startsWith('sk_live_')) && sec.length > 20;
  return pubOk && secOk;
}

const isProtectedRoute = createRouteMatcher([
  '/api/generations(.*)'
]);

// When Clerk is configured: protect /api/generations routes.
// When Clerk is NOT configured: pass every request through unchanged.
export default isClerkConfigured()
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : function dummyProxy() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
