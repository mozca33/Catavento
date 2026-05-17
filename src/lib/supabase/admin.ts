import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase admin (service role).
 * NUNCA expor ao client. Usado apenas em rotas server-side específicas
 * que precisam burlar RLS (webhooks, jobs de manutenção).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin credentials missing");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
