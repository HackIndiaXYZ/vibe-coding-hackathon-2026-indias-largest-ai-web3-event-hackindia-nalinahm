import { AlertCircle } from "lucide-react"

export function SupabaseSetupNotice() {
  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <div className="flex gap-2">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium text-amber-100">Supabase not configured</p>
          <p className="mt-1 text-amber-200/90">
            Add your project URL and anon key to{" "}
            <code className="rounded bg-black/20 px-1 py-0.5">.env.local</code>{" "}
            (see <code className="rounded bg-black/20 px-1 py-0.5">.env.example</code>
            ), then restart <code className="rounded bg-black/20 px-1 py-0.5">npm run dev</code>.
          </p>
        </div>
      </div>
    </div>
  )
}
