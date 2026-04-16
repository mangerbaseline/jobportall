import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/storeProvide";
import AuthProvider from "@/components/provider/authProvider";
import { Toaster } from "sonner";
import AppleNavbar from "@/components/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TalentBridge — Find Your Next Opportunity",
  description:
    "TalentBridge connects top talent with world-class employers. Browse thousands of curated jobs or post openings and discover your next great hire.",
  keywords: ["jobs", "hiring", "job portal", "careers", "recruitment"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="relative min-h-screen w-full bg-background text-foreground">
        <div className="relative z-10">
          <StoreProvider>
            <AuthProvider>
              <AppleNavbar />
              {children}
              <Toaster
                position="top-right"
                richColors
                toastOptions={{
                  style: {
                    background: "oklch(0.14 0.006 264)",
                    border: "1px solid oklch(1 0 0 / 10%)",
                    color: "oklch(0.96 0 0)",
                  },
                }}
              />
            </AuthProvider>
          </StoreProvider>
        </div>
      </body>
    </html>
  );
}
