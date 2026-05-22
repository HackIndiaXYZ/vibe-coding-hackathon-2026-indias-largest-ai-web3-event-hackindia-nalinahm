const PLACEHOLDER_VALUES = [
  "your_supabase_project_url",
  "your_supabase_anon_key",
  "your_supabase_service_role_key",
]

function isPlaceholder(value: string | undefined): boolean {
  if (!value?.trim()) return true
  const normalized = value.trim().toLowerCase()
  return PLACEHOLDER_VALUES.some((p) => normalized.includes(p))
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (isPlaceholder(url) || isPlaceholder(anonKey)) return false

  try {
    const parsed = new URL(url!)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function getSupabaseConfig() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (Project Settings → API in the Supabase dashboard), then restart the dev server."
    )
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }
}
