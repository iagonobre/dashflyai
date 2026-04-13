import { type NextRequest, NextResponse } from "next/server";

type PublicRoute =
  | { path: string; pathPrefix?: never; whenAuthenticated: "redirect" | "next" }
  | { pathPrefix: string; path?: never; whenAuthenticated: "redirect" | "next" };

const publicRoutes: PublicRoute[] = [
  { path: "/login", whenAuthenticated: "redirect" },
  { path: "/unsubscribe", whenAuthenticated: "next" },
];

const AUTHENTICATED_REDIRECT = "/";
const UNAUTHENTICATED_REDIRECT = "/login";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const publicRoute = publicRoutes.find((route) =>
    route.path ? route.path === path : path.startsWith(route.pathPrefix!)
  );

  const authToken = request.cookies.get("access_token");

  // Rota pública, sem token → permite
  if (!authToken && publicRoute) {
    return NextResponse.next();
  }

  // Rota protegida, sem token → redireciona para login
  if (!authToken && !publicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = UNAUTHENTICATED_REDIRECT;
    return NextResponse.redirect(redirectUrl);
  }

  // Autenticado em rota pública com "redirect" (ex: /login) → redireciona para home
  if (authToken && publicRoute && publicRoute.whenAuthenticated === "redirect") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = AUTHENTICATED_REDIRECT;
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets/).*)",
  ],
};
