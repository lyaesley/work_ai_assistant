import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 서버(API Route)에서만 사용. Secret key 사용하므로 클라이언트에 노출 금지.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}
