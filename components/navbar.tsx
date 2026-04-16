"use client";
import { clearUser } from "@/lib/features/user/userSlice";
import { useAppSelector } from "@/lib/hook/hook";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { Briefcase, Menu, X, ChevronDown, LogOut, User } from "lucide-react";

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
      setIsMobileMenuOpen(false);
      router.push("/auth/signin");
    }
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const dashboardLink =
    user.role === "EMPLOYER" ? "/employer" : user.role ? "/user" : null;

  return (
    <>
      {/* ─── Main Navbar ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[oklch(0.09_0_0/95%)] backdrop-blur-xl border-b border-white/8 shadow-xl shadow-black/30"
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
              <span className="font-bold text-lg tracking-tight text-white">
                Talent
                <span className="brand-text">Bridge</span>
              </span>
            </Link>

            {/* ── Center Nav Links (Desktop) ── */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative px-4 py-2 text-sm font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/8 transition-all duration-200"
                >
                  {item.name}
                </Link>
              ))}
              {dashboardLink && (
                <Link
                  href={dashboardLink}
                  className="relative px-4 py-2 text-sm font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/8 transition-all duration-200"
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* ── Right Actions (Desktop) ── */}
            <div className="hidden md:flex items-center gap-3">
              {user.role ? (
                <div className="flex items-center gap-3">
                  {/* User chip */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10">
                    <div className="w-6 h-6 rounded-full brand-gradient flex items-center justify-center text-xs font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </div>
                    <span className="text-sm text-white/80 font-medium">
                      {user.name?.split(" ")[0]}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                      {user.role === "EMPLOYER" ? "Employer" : "Seeker"}
                    </span>
                  </div>
                  {/* Logout */}
                  <button
                    onClick={handelLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/8 transition-all duration-200"
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
                    className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-semibold text-white rounded-lg brand-gradient hover:opacity-90 transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile Hamburger ── */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-white/8 border border-white/10 text-white transition-all duration-200 hover:bg-white/12"
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
      </nav>

      {/* ─── Mobile Menu ─── */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <div className="mx-4 mt-2 rounded-2xl bg-[oklch(0.14_0.006_264)] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
          <div className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-white hover:bg-white/8 rounded-xl transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {dashboardLink && (
              <Link
                href={dashboardLink}
                className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-white hover:bg-white/8 rounded-xl transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Mobile auth section */}
          <div className="border-t border-white/8 p-4">
            {user.role ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
                  <div className="w-9 h-9 rounded-full brand-gradient flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-indigo-300">
                      {user.role === "EMPLOYER" ? "Employer" : "Job Seeker"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handelLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/auth/signin"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
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
