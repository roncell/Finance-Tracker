import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 1. Define routes that should require authentication
const isProtectedRoute = createRouteMatcher(['/']);

export default clerkMiddleware(async (auth, request) => {
    // 2. Check if the current route is protected
    if (isProtectedRoute(request)) {
        // 3. Force the user to sign in if they aren't authenticated
        // Note: auth.protect() is asynchronous
        await auth.protect();
    }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};