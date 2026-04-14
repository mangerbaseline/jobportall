"use client";
import { clearUser } from "@/lib/features/user/userSlice";
import { useAppSelector } from "@/lib/hook/hook";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";

const AppleNavbar = () => {
  // const router = useRouter()
  const user = useAppSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handelLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    //delete cookies of token
    const res = await fetch("/api/logout", {
      method: "GET",
      credentials: "include",
    });
    if (res.ok) {
      // router.push("/auth/signin")
      dispatch(clearUser());
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About us", href: "/about" },
    { name: "Contact us", href: "/contact" },
  ];

  return (
    <>
      <nav className="fixed w-full top-0 right-0 md:top-0 md:left-0 md:right-0 z-10 flex md:justify-center px-4 py-3 backdrop-blur-md border-b border-dashed border-white/10">
        <div className="flex items-center justify-between md:w-auto md:min-w-[200px]">
          {/* Mobile menu button - visible only on mobile */}
          <button
            className="hidden max-sm:flex justify-end p-2 z-60 bg-gray-800"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <div
              className={`flex flex-col justify-between w-5.5 h-4 transition-all duration-300 ${isMobileMenuOpen ? "open" : ""}`}
            >
              <span
                className={`block h-0.5 w-full bg-white rounded-sm transition-all duration-300 ${isMobileMenuOpen ? "translate-y-1.5 rotate-45" : ""}`}
              />
              <span
                className={`block h-0.5 w-full bg-white rounded-sm transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-0.5 w-full bg-white rounded-sm transition-all duration-300 ${isMobileMenuOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
              />
            </div>
          </button>

          {/* Centered Nav Links */}
          <div className="flex gap-8 px-6 py-2 bg-black/80 backdrop-blur-md rounded-full border border-white/15 max-sm:hidden">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white/85 hover:text-white text-sm font-medium tracking-wide whitespace-nowrap transition-all duration-200 hover:scale-105"
              >
                {item.name}
              </Link>
            ))}
            {user.role ? (
              <button
                className="bg-transparent py-0 text-gray-200 text-sm hover:scale-105 font-semibold hover:text-white transition-all duration-200"
                onClick={handelLogout}
              >
                Logout
              </button>
            ) : (
              <Link
                className="bg-transparent py-0 text-gray-200 text-sm hover:scale-105 font-semibold hover:text-white transition-all duration-200"
                href={"/auth/signin"}
              >
                Login
              </Link>
            )}
          </div>

          {/* Invisible spacer for mobile alignment */}
          <div className="flex justify-end w-10 invisible max-sm:visible" />
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div
        className={`fixed top-[60px] left-0 right-0 z-40 flex-col bg-black/85 backdrop-blur-xl border-b border-white/10 transition-all duration-300 overflow-hidden max-sm:flex ${
          isMobileMenuOpen ? "flex max-h-96 py-5" : "hidden max-h-0 py-0"
        }`}
      >
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-white/85 hover:text-white text-lg font-medium py-3 px-6 text-center border-b border-white/8 last:border-b-0 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {item.name}
          </Link>
        ))}
        <button>{}</button>
      </div>
    </>
  );
};

export default AppleNavbar;
