import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rotas que SEMPRE são acessíveis (mesmo sem assinatura ativa).
 * O usuário precisa poder pagar quando o trial expira.
 */
const ALWAYS_ALLOWED_PATHS = [
  "/assinatura",
  "/profile",
  "/auth",
  "/api/chat",     // o filtro de escopo já controla acesso interno
  "/api/webhooks", // webhooks externos (MP, etc.)
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: não inserir código entre createServerClient e getUser
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth");

  const isPublicRoute =
    pathname === "/" ||
    pathname === "/termos" ||
    pathname === "/privacidade" ||
    pathname.startsWith("/api/public");

  // Sem usuário → redireciona pro login (exceto rotas públicas e auth)
  if (!user && !isAuthRoute && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Com usuário: checa assinatura para rotas protegidas
  if (user && !isAuthRoute && !isPublicRoute) {
    const isAlwaysAllowed = ALWAYS_ALLOWED_PATHS.some((p) =>
      pathname.startsWith(p),
    );

    if (!isAlwaysAllowed) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status, trial_ends_at")
        .eq("user_id", user.id)
        .single();

      const hasAccess = subscriptionHasAccess(sub);
      if (!hasAccess) {
        const url = request.nextUrl.clone();
        url.pathname = "/assinatura";
        url.searchParams.set("required", "1");
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

function subscriptionHasAccess(
  sub: { status: string; trial_ends_at: string } | null,
): boolean {
  if (!sub) return false;
  if (sub.status === "active") return true;
  if (sub.status === "trialing") {
    return new Date(sub.trial_ends_at) > new Date();
  }
  return false;
}
