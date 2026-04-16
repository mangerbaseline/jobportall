"use client";
import { Input } from "@/components/ui/input";
import React, { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  Mail,
  Lock,
  UserCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export interface CreateUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

export function SignupForm({ ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [user, setUser] = useState<CreateUser>({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleRole = (value: string) => {
    setUser((prev) => ({ ...prev, role: value }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!user.name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!user.email.trim()) {
      setError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!user.password) {
      setError("Password is required");
      return false;
    }
    if (user.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!user.role) {
      setError("Please select a role");
      return false;
    }
    if (!confirmPass) {
      setError("Please confirm your password");
      return false;
    }
    if (confirmPass !== user.password) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!res.ok) {
        switch (res.status) {
          case 400:
            throw new Error(data.error || "Invalid input data");
          case 409:
            throw new Error(data.error || "User already exists");
          case 500:
            throw new Error("Server error. Please try again later");
          default:
            throw new Error(data.error || "Something went wrong");
        }
      }

      router.push("/auth/signin");
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md" {...props}>
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
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Create your account
        </h1>
        <p className="text-white/50 text-sm">
          Join thousands connecting talent with opportunity.
        </p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => handleRole("USER")}
          className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 ${
            user.role === "USER"
              ? "border-indigo-500/60 bg-indigo-500/12 shadow-lg shadow-indigo-500/15"
              : "border-white/10 bg-white/4 hover:border-indigo-500/30 hover:bg-white/8"
          }`}
        >
          {user.role === "USER" && (
            <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-indigo-400" />
          )}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              user.role === "USER" ? "bg-indigo-500/20" : "bg-white/8"
            }`}
          >
            <UserCircle
              className={`w-5 h-5 ${user.role === "USER" ? "text-indigo-400" : "text-white/40"}`}
            />
          </div>
          <div className="text-center">
            <p
              className={`text-sm font-bold ${user.role === "USER" ? "text-indigo-200" : "text-white/70"}`}
            >
              Job Seeker
            </p>
            <p className="text-xs text-white/35 mt-0.5">Find your next role</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleRole("EMPLOYER")}
          className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 ${
            user.role === "EMPLOYER"
              ? "border-violet-500/60 bg-violet-500/12 shadow-lg shadow-violet-500/15"
              : "border-white/10 bg-white/4 hover:border-violet-500/30 hover:bg-white/8"
          }`}
        >
          {user.role === "EMPLOYER" && (
            <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-violet-400" />
          )}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              user.role === "EMPLOYER" ? "bg-violet-500/20" : "bg-white/8"
            }`}
          >
            <Briefcase
              className={`w-5 h-5 ${user.role === "EMPLOYER" ? "text-violet-400" : "text-white/40"}`}
            />
          </div>
          <div className="text-center">
            <p
              className={`text-sm font-bold ${user.role === "EMPLOYER" ? "text-violet-200" : "text-white/70"}`}
            >
              Employer
            </p>
            <p className="text-xs text-white/35 mt-0.5">Post jobs & hire</p>
          </div>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handelSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-name"
            className="flex items-center gap-2 text-sm font-semibold text-white/70"
          >
            <User className="w-3.5 h-3.5 text-indigo-400" />
            {user.role === "EMPLOYER" ? "Company Name" : "Full Name"}
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            value={user.name}
            placeholder="John Doe"
            required
            onChange={handleChange}
            disabled={loading}
            className="w-full h-11 px-4 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="flex items-center gap-2 text-sm font-semibold text-white/70"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            {user.role === "EMPLOYER" ? "Company Email Address" : "Email"}
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            value={user.email}
            placeholder="you@example.com"
            required
            onChange={handleChange}
            disabled={loading}
            className="w-full h-11 px-4 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50"
          />
        </div>

        {/* Password */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="signup-password"
              className="flex items-center gap-2 text-sm font-semibold text-white/70"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                name="password"
                type={showPass ? "text" : "password"}
                value={user.password}
                required
                onChange={handleChange}
                disabled={loading}
                className="w-full h-11 px-4 pr-10 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="signup-confirm"
              className="text-sm font-semibold text-white/70 block"
            >
              Confirm
            </label>
            <div className="relative">
              <input
                id="signup-confirm"
                type={showConfirmPass ? "text" : "password"}
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                disabled={loading}
                className="w-full h-11 px-4 pr-10 rounded-xl bg-white/6 border border-white/12 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showConfirmPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
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
              Creating Account…
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-white/45 mt-6">
        Already have an account?{" "}
        <a
          href="/auth/signin"
          className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
        >
          Sign in
        </a>
      </p>
    </div>
  );
}
