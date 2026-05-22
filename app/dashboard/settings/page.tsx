"use client";

import { useState } from "react";
import { User, Bell, Palette, Shield, Download, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h3 className="font-semibold text-sm">{title}</h3>
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
);

const Field = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium">{label}</div>
      {desc && <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>}
    </div>
    {children}
  </div>
);

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
      toast.success("Profile updated!");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`relative w-10 h-5.5 rounded-full transition-colors ${checked ? "bg-primary" : "bg-white/10"}`}>
      <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account, preferences, and data.</p>
      </div>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <Field label="Display Name" desc="How your name appears across SynapseAI">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
            className="w-40 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary/40 transition-all" />
        </Field>
        <button onClick={handleSave} disabled={saving || !name.trim()}
          className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 disabled:opacity-50 transition-colors flex items-center gap-2">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Changes
        </button>
      </Section>

      {/* Appearance */}
      <Section icon={Palette} title="Appearance">
        <Field label="Theme" desc="Choose your preferred color scheme">
          <div className="flex gap-1.5">
            {["light", "dark", "system"].map(t => (
              <button key={t} onClick={() => setTheme(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${theme === t ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent"}`}>
                {t}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <Field label="Study Reminders" desc="Get reminded about your scheduled study sessions">
          <Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />
        </Field>
        <Field label="Quiz Results" desc="Notifications when quiz results are ready">
          <Toggle checked={true} onChange={() => {}} />
        </Field>
      </Section>

      {/* Data */}
      <Section icon={Download} title="Your Data">
        <Field label="Export Notes" desc="Download all your notes as a markdown file">
          <button className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-muted-foreground hover:text-foreground border border-white/10 transition-colors flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </Field>
      </Section>

      {/* Danger Zone */}
      <Section icon={Shield} title="Account">
        <Field label="Sign Out" desc="Sign out from all devices">
          <button onClick={handleLogout}
            className="px-4 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors border border-destructive/20">
            Sign Out
          </button>
        </Field>
      </Section>
    </div>
  );
}
