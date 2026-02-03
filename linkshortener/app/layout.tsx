import type { Metadata } from "next";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Button } from "@/components/ui/button";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linkshortener",
  description: "Shorten and share links securely",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="flex items-center justify-between border-b border-zinc-200 bg-white/70 px-6 py-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/40">
            <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Linkshortener
            </div>
            <nav className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost">Sign in</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Sign up</Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </nav>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
