import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: { default: "SynapseAI – AI Study Companion", template: "%s | SynapseAI" },
  description: "AI-powered study companion for engineering students. Upload syllabi, generate notes, quizzes, and study plans instantly.",
  keywords: ["AI tutor", "study companion", "engineering notes", "quiz generator", "study planner"],
  openGraph: {
    title: "SynapseAI",
    description: "Your AI-powered engineering study companion",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(geistSans.variable, geistMono.variable)}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
