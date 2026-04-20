"use client";
import GradientBlobs from "@/components/bg/gradientblobs";
import { Users, Target, Rocket, Award, Shield, Heart } from "lucide-react";

const stats = [
  { label: "Active Users", value: "50K+" },
  { label: "Jobs Posted", value: "120K+" },
  { label: "Companies", value: "5K+" },
  { label: "Placements", value: "25K+" },
];

const values = [
  {
    icon: Target,
    title: "Our Mission",
    desc: "To connect talent with opportunity and help people build meaningful careers that change their lives.",
  },
  {
    icon: Rocket,
    title: "Our Vision",
    desc: "To become the world's most trusted and efficient platform for career growth and talent acquisition.",
  },
  {
    icon: Heart,
    title: "User First",
    desc: "We prioritize the needs of both job seekers and employers to ensure a seamless experience for everyone.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <GradientBlobs />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 animate-fade-up">
            Empowering Careers <br />
            <span className="brand-text">Building Futures</span>
          </h1>
          <p className="text-lg text-white/55 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: "0.1s" }}>
            JobPortal is more than just a job board. We are a community of professionals 
            and innovators dedicated to making the hiring process faster, smarter, and more human.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-up">
              <h2 className="text-3xl font-bold text-white">Our Story</h2>
              <p className="text-white/50 leading-relaxed">
                Founded in 2024, JobPortal started with a simple idea: that finding a job 
                shouldn&apos;t be a full-time job itself. We saw the frustration in the market 
                — complex forms, lack of transparency, and slow response times.
              </p>
              <p className="text-white/50 leading-relaxed">
                Today, we serve thousands of users daily, providing them with the tools they 
                need to succeed in a rapidly evolving job market. Our platform leverages 
                modern technology to match the right candidates with the right roles, 
                saving time for everyone involved.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Award Winning Platform</h4>
                  <p className="text-xs text-white/40">Recognized for innovation in HR tech</p>
                </div>
              </div>
            </div>
            <div className="relative group animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="absolute -inset-1 brand-gradient rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative glass-card rounded-3xl p-8 aspect-video flex items-center justify-center">
                <div className="text-center">
                   <Users className="w-20 h-20 text-indigo-400/20 mx-auto mb-4" />
                   <p className="text-white/30 font-medium italic">&quot;Connecting millions of dreams with reality&quot;</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-center hover:border-indigo-500/30 transition-all duration-300">
                <div className="text-3xl font-extrabold brand-text mb-1">{stat.value}</div>
                <div className="text-xs text-white/40 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Our Core Values</h2>
            <p className="text-white/50">The principles that guide everything we do.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <div key={i} className="glass-card rounded-3xl p-8 hover:border-indigo-500/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
