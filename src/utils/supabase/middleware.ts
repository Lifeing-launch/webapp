import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_PATHS, PUBLIC_PATHS } from "../constants";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

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

  const { origin } = request.nextUrl;
  const signedIn = !!user;

  // Handle protected API routes
  if (isProtectedAPIPath(pathname)) {
    if (!signedIn) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Set user info in headers for API routes to avoid redundant auth calls
    supabaseResponse.headers.set("x-user-id", user.id);
    supabaseResponse.headers.set("x-user-email", user.email || "");

    return supabaseResponse;
  }

  if (!signedIn) {
    if (!isAuthPath(pathname)) {
      // Not signed in and accessing non-auth path → send to login
      return NextResponse.redirect(`${origin}/login`);
    } else {
      // Not signed in and accessing auth path → let them through
      return supabaseResponse;
    }
  }

  // From this point on, user is signed in

  // Check active subscription for protected pages
  const { data: subscription } = await supabase
    .from("active_subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const onPlansPage = pathname === "/plans";
  const shouldRedirectToPlans = !subscription && !onPlansPage;
  const shouldRedirectToDashboard = subscription && isAuthPath(pathname);

  if (shouldRedirectToPlans) {
    return NextResponse.redirect(`${origin}/plans`);
  }

  if (shouldRedirectToDashboard) {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // Set user info in headers for server components
  supabaseResponse.headers.set("x-user-id", user.id);
  supabaseResponse.headers.set("x-user-email", user.email || "");

  return supabaseResponse;
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some(({ path, exact }) =>
    exact ? pathname === path : pathname.startsWith(path)
  );
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(({ path, exact }) =>
    exact ? pathname === path : pathname.startsWith(path)
  );
}

function isProtectedAPIPath(pathname: string): boolean {
  // Any API route that's not in the public API paths is protected
  return pathname.startsWith("/api") && !isPublicPath(pathname);
}
