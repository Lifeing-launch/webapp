import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_PATHS, PUBLIC_PATHS } from "../constants";
import { createClient } from "./server";

export async function updateSession(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
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

  // // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, origin } = request.nextUrl;
  const signedIn = Boolean(user);

  if (!signedIn && !isAuthPath(pathname)) {
    // Not signed in and accessing non-auth path → send to login
    return NextResponse.redirect(`${origin}/login`);
  }

  if (!signedIn && isAuthPath(pathname)) {
    // Signed in and accessing auth path → let them through
    return supabaseResponse;
  }

  // Signed in and on an auth page (login/signup) → send to dashboard
  if (signedIn && isAuthPath(pathname)) {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // Check active subscription
  const { data: sub } = await supabase
    .from("active_subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", user!.id)
    .single();

  const hasSubscription = Boolean(sub);
  const onPlansPage = pathname === "/plans";

  if (!hasSubscription && !onPlansPage) {
    // No subscription → send to plans
    return NextResponse.redirect(`${origin}/plans`);
  }

  if (hasSubscription && onPlansPage) {
    // Has subscription but still on plans → send to dashboard
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // Everything’s in order → let request proceed
  return supabaseResponse;
}

export async function checkUserIsAuthenticated() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthenticated user");
  }

  return user;
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
