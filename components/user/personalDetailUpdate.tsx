// components/user/personalDetailUpdate.tsx
"use client";

import { useState, useEffect } from "react";
import {
  User,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ChevronRight,
  Mail,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/lib/hook/hook";
import { updatePersonalDetail } from "@/lib/features/user/profileDetail";

const PersonalDetailsForm = () => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
    gender: "",
    bio: "",
    website: "",
    dob: "",
    avatar: null as File | null,
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch existing details on mount
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const [personalRes, userRes] = await Promise.all([
          fetch("/api/user/personaldetail"),
          fetch("/api/user")
        ]);
        
        const json = await personalRes.json();
        const userJson = await userRes.json();
        
        if (userJson.success && userJson.user) {
          setUserEmail(userJson.user.email);
          setIsVerified(userJson.user.verified);
        }
        if (json.success && json.data && json.data.length > 0) {
          const existing = json.data[0];
          console.log(existing);
          setFormData({
            phone: existing.phone || "",
            address: existing.address || "",
            city: existing.city || "",
            state: existing.state || "",
            country: existing.country || "",
            zipcode: existing.zipCode || "",
            gender: existing.gender || "",
            bio: existing.bio || "",
            website: existing.website || "",
            dob: existing.dob
              ? new Date(existing.dob).toISOString().split("T")[0]
              : "",
            avatar: existing.avatar || null,
          });
          if (existing.avatar) setPreviewUrl(existing.avatar);
        }
      } catch (err) {
        console.error("Error fetching details:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchExisting();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large (max 5MB)");
        return;
      }
      setFormData((prev) => ({ ...prev, avatar: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          submitData.append(key, value);
        }
      });

      console.log("submit - data : ", submitData);

      const resultAction = await dispatch(updatePersonalDetail(submitData));

      if (updatePersonalDetail.rejected.match(resultAction)) {
        throw new Error(
          (resultAction.payload as string) || "Failed to save details",
        );
      }

      setSuccess("Your personal profile has been updated successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend");
      setSuccess("Verification email sent! Please check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error resending email");
    } finally {
      setResendingEmail(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-white/50 animate-pulse font-medium">
          Loading your profile...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5">
              <User className="w-6 h-6 text-primary" />
            </div>
            Personal Details
          </h1>
          <p className="text-white/50 mt-2 text-sm md:text-base max-w-lg">
            Complete your profile to stand out to potential employers and build
            your professional presence.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Messages */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 animate-in fade-in zoom-in duration-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-400 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Bio */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] flex flex-col items-center gap-6 text-center shadow-xl shadow-black/40">
              <div className="relative group">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-white/10 overflow-hidden bg-white/5 shadow-2xl transition-all duration-500 group-hover:border-primary/40 group-hover:scale-[1.02]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-20 h-20 text-white/10" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-1 right-1 p-3 rounded-full brand-gradient text-white cursor-pointer shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-background">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-lg text-white">Profile Photo</h3>
                <p className="text-xs text-white/30 leading-relaxed px-4">
                  Professional photos help establish trust with recruiters.
                </p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-primary ml-1">
                <Briefcase className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">
                  Your Bio
                </h3>
              </div>
              <textarea
                name="bio"
                placeholder="Briefly describe yourself, your career path, and your key strengths..."
                value={formData.bio}
                onChange={handleInputChange}
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Right Column: Information Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-black/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                
                {/* Email (Read-only) & Verification */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                      <Mail className="w-3 h-3 text-primary/60" /> Email Address
                    </label>
                    {isVerified ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Unverified
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white/50 focus:outline-none font-medium cursor-not-allowed"
                    />
                    {!isVerified && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendingEmail}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/20 hover:bg-primary/40 text-primary px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendingEmail ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        Resend
                      </button>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                    <Phone className="w-3 h-3 text-primary/60" /> contact number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                    <Calendar className="w-3 h-3 text-primary/60" /> date of
                    birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all scheme-dark cursor-pointer"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                    <Globe className="w-3 h-3 text-primary/60" /> personal
                    website
                  </label>
                  <input
                    type="url"
                    name="website"
                    placeholder="https://yourportfolio.com"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                    <User className="w-3 h-3 text-primary/60" /> gender
                  </label>
                  <div className="relative">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer font-medium"
                    >
                      <option value="" disabled className="bg-[#0f0f0f]">
                        Select Gender
                      </option>
                      <option value="male" className="bg-[#0f0f0f]">
                        Male
                      </option>
                      <option value="female" className="bg-[#0f0f0f]">
                        Female
                      </option>
                      <option value="other" className="bg-[#0f0f0f]">
                        Other
                      </option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Location Header */}
                <div className="md:col-span-2 pt-6 mt-2 border-t border-white/5">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-4 opacity-50">
                    Location Details
                  </h4>
                </div>

                {/* Address */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1 flex items-center gap-2 italic">
                    <MapPin className="w-3 h-3 text-primary/60" /> street
                    address
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="123 Tech Park, Silicon Valley"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                  />
                </div>

                {/* City & State */}
                <div className="space-y-2">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                  />
                </div>

                {/* Country & Zipcode */}
                <div className="space-y-2">
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="zipcode"
                    placeholder="Postal Code"
                    value={formData.zipcode}
                    onChange={handleInputChange}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="mt-12">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl brand-gradient text-white font-extrabold text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      Save Details
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetailsForm;
