import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const user = await auth();

  // 🚨 Evitar bloquear la página de callback de Clerk
  if (req.nextUrl.pathname === "/sso-callback") {
    return NextResponse.next(); // deja pasar la solicitud
  }

  // 🚨 Proteger rutas privadas
  if (isProtectedRoute(req)) {
    if (!user?.userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  // 🚨 Redirigir login/register si ya está logueado
  if (
    (req.nextUrl.pathname.startsWith("/sign-in") ||
      req.nextUrl.pathname.startsWith("/sign-up")) &&
    user?.userId
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Saltar archivos estáticos y Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Ejecutar siempre en API routes
    "/(api|trpc)(.*)",
  ],
};
