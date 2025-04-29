import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_PATHS } from "../constants";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const matchesProtectedPath = AUTH_PATHS.every(
    (path) => !request.nextUrl.pathname.startsWith(path)
  );
  const matchesAuthPath = !matchesProtectedPath;

  if (!user && matchesProtectedPath) {
    // no user, respond by redirecting the user to the login page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && matchesAuthPath) {
    // if user accesses any auth path, redirect to dashboard
    return NextResponse.redirect(new URL("/", request.url));
  }

  //  user must be accessing a protected page at this point. Let them through
  return supabaseResponse;
}
