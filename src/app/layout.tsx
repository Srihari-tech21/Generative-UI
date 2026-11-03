import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/context/ThemeContext";
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
  "antialiased min-h-screen flex flex-col font-sans transition-colors duration-200 bg-[#f8fafc] text-slate-900 dark:bg-[#080a0f] dark:text-[#f1f5f9]";

// Inline script to prevent theme flash before hydration
const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('genui-theme');
    var isDark = true;
    if (saved === 'light') {
      isDark = false;
    } else if (saved === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    var root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );

  if (isClerkConfigured()) {
    return (
      <ClerkProvider>
        <html lang="en" className="h-full dark" suppressHydrationWarning>
          <head>
            <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
          </head>
          <body className={bodyClass}>
            {content}
          </body>
        </html>
      </ClerkProvider>
    );
  }

  // Anonymous / demo mode — Clerk is not configured, skip ClerkProvider entirely.
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={bodyClass}>
        {content}
      </body>
    </html>
  );
}
