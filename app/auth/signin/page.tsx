import { LoginForm } from "@/components/login-form";
import GradientBlobs from "@/components/bg/gradientblobs";
import { Briefcase, Users, TrendingUp, Star } from "lucide-react";

const highlights = [
  { icon: Briefcase, text: "1,200+ curated job listings" },
  { icon: Users, text: "850+ companies hiring now" },
  { icon: TrendingUp, text: "92% placement rate" },
  { icon: Star, text: "Trusted by 4,500+ job seekers" },
];

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex">
      <GradientBlobs />

      {/* ── Left Panel (decorative) — hidden on mobile ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] shrink-0 p-12 relative overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-violet-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">
              Job<span className="brand-text">Portal</span>
            </span>
          </div>

          <h2 className="text-4xl font-extrabold text-white leading-snug mb-4">
            Your next opportunity
            <br />
            <span className="brand-text">starts here.</span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-12 max-w-sm">
            Join the platform connecting exceptional Job with world-class
            employers.
          </p>

          <div className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-white/65 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <LoginForm />
      </div>
    </div>
  );
}
