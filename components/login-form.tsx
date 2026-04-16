"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hook/hook";
import { setUser } from "@/lib/features/user/userSlice";
import type { LoginUser } from "@/types";
import { Briefcase, Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const dispatch = useAppDispatch();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginUser = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        return;
      }

      dispatch(
        setUser({
          id: data?.user?.id || "",
          name: data?.user?.name || "",
          role: data?.user?.role || "",
        }),
      );

      if (data?.user?.role === "EMPLOYER") {
        router.push("/employer");
      } else {
        router.push("/user");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("w-full max-w-md", className)} {...props}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl text-white">
          Talent<span className="brand-text">Bridge</span>
        </span>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">Welcome back</h1>
        <p className="text-white/50 text-sm">
          Sign in to your account to continue
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="flex items-center gap-2 text-sm font-semibold text-white/70">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="flex items-center gap-2 text-sm font-semibold text-white/70">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              Password
            </label>
            <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPass ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 pr-11 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 h-11 mt-2 rounded-xl brand-gradient text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 hover:opacity-90 hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-xs text-white/30 font-medium">OR</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-white/45">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}
