import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/storeProvide";
import AuthProvider from "@/components/provider/authProvider";
import { Toaster } from "sonner";
import AppleNavbar from "@/components/navbar";
import Footer from "@/components/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JobPortal — Find Your Next Opportunity",
  description:
    "JobPortal connects top Job with world-class employers. Browse thousands of curated jobs or post openings and discover your next great hire.",
  keywords: ["jobs", "hiring", "job portal", "careers", "recruitment"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('theme');
                if (t === 'dark') document.documentElement.classList.add('dark');
              })();
            `,
          }}
        />
      </head>
      <body className="relative min-h-screen w-full bg-background text-foreground">
        <div className="relative z-10">
          <StoreProvider>
            <AuthProvider>
              <AppleNavbar />
              <main className="min-h-[80vh]">
                {children}
              </main>
              <Footer />
              <Toaster
                position="top-right"
                richColors
              />
            </AuthProvider>
          </StoreProvider>
        </div>
      </body>
    </html>
  );
}
