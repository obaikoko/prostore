export { auth as middleware } from '@/auth';

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'], // Apply only to specific routes
};
