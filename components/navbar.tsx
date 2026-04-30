"use client";
import { clearUser } from "@/lib/features/user/userSlice";
import { clearUserDetail } from "@/lib/features/user/profileDetail";
import { useAppSelector } from "@/lib/hook/hook";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { Briefcase, Menu, X, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const AppleNavbar = () => {
  const user = useAppSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide navbar on auth pages after hooks are called
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  const handelLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const res = await fetch("/api/logout", {
      method: "GET",
      credentials: "include",
    });
    if (res.ok) {
      dispatch(clearUser());
      dispatch(clearUserDetail());
      setIsMobileMenuOpen(false);
      router.refresh();
      router.push("/auth/signin");
    }
  };

  const dashboardLink =
    user.role === "ADMIN"
      ? "/admin"
      : user.role === "EMPLOYER"
        ? "/employer"
        : user.role === "USER"
          ? "/user"
          : null;

  const navItems = user.role
    ? [
        { name: "Dashboard", href: dashboardLink! },
        ...(user.role === "ADMIN"
          ? [{ name: "Customer Queries", href: "/admin/customer-queries" }]
          : []),
        ...(user.role === "EMPLOYER"
          ? [{ name: "Interviews", href: "/employer/schedule" }]
          : []),
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
      ]
    : [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
      ];

  return (
    <>
      {/* ─── Main Navbar ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm dark:shadow-xl dark:shadow-black/30"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg brand-gradient shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow duration-300">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                Job
                <span className="brand-text">Portal</span>
              </span>
            </Link>

            {/* ── Center Nav Links (Desktop) ── */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* ── Right Actions (Desktop) ── */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {user.loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-32 h-9 rounded-xl bg-muted animate-pulse" />
                </div>
              ) : user.role ? (
                <div className="flex items-center gap-3">
                  {/* User chip */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
                    <div className="w-6 h-6 rounded-full brand-gradient flex items-center justify-center text-xs font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </div>
                    <span className="text-sm text-foreground font-medium">
                      {user.name?.split(" ")[0]}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      {user.role === "ADMIN"
                        ? "Admin"
                        : user.role === "EMPLOYER"
                          ? "Employer"
                          : "Seeker"}
                    </span>
                  </div>
                  {/* Logout */}
                  <button
                    onClick={handelLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-all duration-200"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    prefetch={false}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    prefetch={false}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-lg brand-gradient hover:opacity-90 transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile Hamburger ── */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-card border border-border text-foreground transition-all duration-200 hover:bg-accent"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Menu ─── */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <div className="mx-4 mt-2 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
          <div className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile auth section */}
          <div className="border-t border-border p-4">
            {user.loading ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-xl animate-pulse">
                <div className="w-9 h-9 rounded-full bg-muted-foreground/20 shrink-0" />
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-1/3" />
                </div>
              </div>
            ) : user.role ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-xl">
                  <div className="w-9 h-9 rounded-full brand-gradient flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs text-primary">
                      {user.role === "ADMIN"
                        ? "Admin"
                        : user.role === "EMPLOYER"
                          ? "Employer"
                          : "Job Seeker"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handelLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-accent rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/auth/signin"
                  prefetch={false}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-accent rounded-xl transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  prefetch={false}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white brand-gradient rounded-xl transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started — It&apos;s Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AppleNavbar;
