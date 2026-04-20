"use client";
import GradientBlobs from "@/components/bg/gradientblobs";
import { Shield, Lock, Eye, FileText, Globe, Bell } from "lucide-react";

export default function PrivacyPage() {
  const lastUpdated = "April 20, 2026";

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: "We collect information you provide directly to us when you create an account, build a profile, or apply for jobs. This includes your name, email address, phone number, work history, and skills.",
    },
    {
      icon: Lock,
      title: "How We Use Your Data",
      content: "We use your information to provide and improve our services, including matching you with relevant job opportunities, communicating with you about applications, and ensuring the security of our platform.",
    },
    {
      icon: Globe,
      title: "Data Sharing",
      content: "We share your profile and application data with employers when you apply for a job. We do not sell your personal information to third parties for marketing purposes.",
    },
    {
      icon: Bell,
      title: "Your Choices",
      content: "You can update your profile information, manage your notification preferences, or request the deletion of your account at any time through your dashboard settings.",
    },
  ];

  return (
    <div className="min-h-screen">
      <GradientBlobs />

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-6">
              <Shield className="w-3.5 h-3.5" />
              Privacy Matters
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Privacy <span className="brand-text">Policy</span>
            </h1>
            <p className="text-white/50">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="glass-card rounded-3xl p-8 sm:p-12 space-y-12">
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-white/70 leading-relaxed">
                  At JobPortal, we take your privacy seriously. This policy explains how we collect, 
                  use, and protect your personal information when you use our platform.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {sections.map((section, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/8 hover:border-indigo-500/30 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                      <section.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{section.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-white/8 space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FileText className="w-6 h-6 text-indigo-400" />
                  Detailed Provisions
                </h2>
                <div className="space-y-6 text-white/60 text-sm leading-relaxed">
                  <p>
                    <strong>1. Security:</strong> We implement industry-standard security measures 
                    to protect your data from unauthorized access, alteration, or disclosure. 
                    However, no method of transmission over the internet is 100% secure.
                  </p>
                  <p>
                    <strong>2. Cookies:</strong> We use cookies to enhance your experience, 
                    remember your preferences, and analyze how our platform is used. You can 
                    control cookie settings in your browser.
                  </p>
                  <p>
                    <strong>3. Changes to Policy:</strong> We may update this policy from time to 
                    time. We will notify you of any significant changes by posting the new 
                    policy on this page and updating the &quot;Last updated&quot; date.
                  </p>
                  <p>
                    <strong>4. Contact Us:</strong> If you have any questions about this Privacy 
                    Policy, please contact us at privacy@jobportal.com.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
