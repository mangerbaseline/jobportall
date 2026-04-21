"use client";
import { useState } from "react";
import GradientBlobs from "@/components/bg/gradientblobs";
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitted(true);
        toast.success("Message sent successfully! We'll get back to you soon.");
      } else {
        toast.error(result.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <GradientBlobs />

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Contact Info */}
            <div className="space-y-12 animate-fade-up">
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
                  Get in <span className="brand-text">Touch</span>
                </h1>
                <p className="text-lg text-white/55 leading-relaxed">
                  Have questions about our platform or need assistance with your job search? 
                  Our team is here to help you every step of the way.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:brand-gradient group-hover:text-white transition-all duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1">Email Us</p>
                    <p className="text-white font-semibold">support@jobportal.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:brand-gradient group-hover:text-white transition-all duration-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1">Call Us</p>
                    <p className="text-white font-semibold">+1 (555) 000-0000</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:brand-gradient group-hover:text-white transition-all duration-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1">Visit Us</p>
                    <p className="text-white font-semibold">123 Career Blvd, Suite 100, SF, CA</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-3 text-indigo-300">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="font-bold">Live Support</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  Our support team is available Monday through Friday, 9am - 6pm PST. 
                  Expect a response within 24 hours.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="relative group animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="absolute -inset-1 brand-gradient rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative glass-card rounded-3xl p-8 sm:p-10">
                {submitted ? (
                  <div className="text-center py-12 space-y-6">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto text-green-400">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
                      <p className="text-white/50">Thank you for reaching out. Our team will review your message and contact you soon.</p>
                    </div>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-white/70 ml-1">Full Name</label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          placeholder="John Doe"
                          className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-white/70 ml-1">Email Address</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="john@example.com"
                          className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-white/70 ml-1">Subject</label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        placeholder="How can we help?"
                        className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-white/70 ml-1">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        placeholder="Tell us more about your inquiry..."
                        className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-8 py-4 font-bold text-white rounded-xl brand-gradient hover:opacity-90 transition-all duration-200 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
