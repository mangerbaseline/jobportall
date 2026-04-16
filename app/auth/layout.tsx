import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
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
  title: "JobPortal — Find Your Next Opportunity",
  description:
    "JobPortal connects top Job with world-class employers. Browse thousands of curated jobs or post openings and discover your next great hire.",
  keywords: ["jobs", "hiring", "job portal", "careers", "recruitment"],
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="auth-layout-wrapper">{children}</div>;
}
