import { default as nextAuthMiddleware } from "next-auth/middleware";

// In Next.js 16+, middleware is renamed to proxy.
// It needs a named export 'proxy' or a default export.
export const proxy = nextAuthMiddleware;
export default nextAuthMiddleware;

export const config = {
  matcher: ["/((?!auth|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
