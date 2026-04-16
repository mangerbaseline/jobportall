import { SignupForm } from "@/components/signup-form";
import GradientBlobs from "@/components/bg/gradientblobs";
import { Briefcase, ShieldCheck, Zap, Globe } from "lucide-react";

const perks = [
  { icon: Zap, text: "Set up your profile in under 2 minutes" },
  { icon: Globe, text: "Access jobs from companies worldwide" },
  { icon: ShieldCheck, text: "Verified employers & secure applications" },
  { icon: Briefcase, text: "Smart job matching based on your skills" },
];

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen flex">
      <GradientBlobs />

      {/* ── Left Panel (decorative) — hidden on mobile ── */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] shrink-0 p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-indigo-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">
              Talent<span className="brand-text">Bridge</span>
            </span>
          </div>

          <h2 className="text-4xl font-extrabold text-white leading-snug mb-4">
            Get hired faster.<br />
            <span className="brand-text">Or hire smarter.</span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-12 max-w-sm">
            Whether you&apos;re seeking your next role or building your dream team — TalentBridge gets you there.
          </p>

          <div className="space-y-4">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-white/65 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10 inline-flex items-center gap-3 glass-card rounded-2xl px-5 py-3">
          <div className="flex -space-x-2">
            {["A", "B", "C"].map((l) => (
              <div key={l} className="w-8 h-8 rounded-full brand-gradient border-2 border-[oklch(0.14_0.006_264)] flex items-center justify-center text-xs font-bold text-white">
                {l}
              </div>
            ))}
          </div>
          <p className="text-sm text-white/70">
            <span className="font-bold text-white">4,500+</span> members joined this month
          </p>
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <SignupForm />
      </div>
    </div>
  );
}