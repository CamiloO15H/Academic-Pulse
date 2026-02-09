import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// Keep a singleton for simple client-side usage if needed
export const supabase = createClient();
