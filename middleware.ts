import { auth } from "./auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isApi = req.nextUrl.pathname.startsWith('/api');
  
  // Protect API mutation routes
  if (isApi && req.method !== 'GET') {
    if (!isLoggedIn) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|news|crypto|finance|admin/login).*)", "/api/generate", "/api/articles", "/api/ads"],
};
