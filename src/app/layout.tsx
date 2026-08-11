import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenUI — Generative UI for Dynamic Workflows",
  description: "Instantly translate natural language descriptions into live, interactive, data-wired user interfaces.",
};

/**
 * Returns true only when both Clerk keys are present AND look like real keys.
 * A key is considered real if it starts with pk_test_ or pk_live_ (publishable)
 * and is at least 40 characters long — this rejects empty strings, placeholder
 * comments, and any fake key we may have written during scaffolding.
 */
function isClerkConfigured(): boolean {
  const pub = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const sec = process.env.CLERK_SECRET_KEY ?? "";
  const pubOk = (pub.startsWith("pk_test_") || pub.startsWith("pk_live_")) && pub.length > 40;
  const secOk = (sec.startsWith("sk_test_") || sec.startsWith("sk_live_")) && sec.length > 20;
  return pubOk && secOk;
}

const bodyClass =
  "antialiased bg-slate-50 text-slate-900 min-h-screen dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (isClerkConfigured()) {
    return (
      <ClerkProvider>
        <html lang="en" className="h-full">
          <body className={bodyClass}>
            {children}
          </body>
        </html>
      </ClerkProvider>
    );
  }

  // Anonymous / demo mode — Clerk is not configured, skip ClerkProvider entirely.
  // The app renders fully; auth-dependent features show a "sign-in unavailable" state.
  return (
    <html lang="en" className="h-full">
      <body className={bodyClass}>
        {children}
      </body>
    </html>
  );
}
