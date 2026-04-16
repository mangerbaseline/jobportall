"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hook/hook";
import {
  fetchUserDetail,
  clearUserDetail,
} from "@/lib/features/user/profileDetail";
import { Briefcase, ShieldCheck, User as UserIcon, TrendingUp } from "lucide-react";

export default function UserDetail() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { data, loading, error } = useAppSelector((state) => state.details);

  useEffect(() => {
    if (!user.id) return;
    dispatch(fetchUserDetail(user.id));
    return () => {
      dispatch(clearUserDetail());
    };
  }, [user.id, dispatch]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/8 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/8 rounded-lg w-2/5" />
            <div className="h-3 bg-white/5 rounded-lg w-1/4" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-16 bg-white/5 rounded-xl" />
          <div className="h-16 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card rounded-2xl p-5 border-red-500/20 text-red-400 text-sm">
        Error loading profile: {error || "User not found"}
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center shadow-lg shadow-indigo-500/25 overflow-hidden">
            {data.personal?.avatar ? (
              <img
                src={data.personal.avatar}
                alt={data.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-extrabold text-white">
                {data.name?.charAt(0)?.toUpperCase() ?? "E"}
              </span>
            )}
          </div>
          {/* Online dot */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[oklch(0.14_0.006_264)] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white truncate">{data.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-[10px] font-bold text-indigo-300 tracking-widest uppercase">
              <ShieldCheck className="w-3 h-3" />
              {data.role}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-bold text-emerald-300 tracking-widest uppercase">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-indigo-500/8 border border-indigo-500/20 flex flex-col gap-1 hover:bg-indigo-500/12 transition-colors duration-200">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" />
            Jobs Posted
          </div>
          <div className="text-3xl font-extrabold brand-text mt-1">
            {data._count.jobs}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 flex flex-col gap-1 hover:bg-emerald-500/12 transition-colors duration-200">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            Status
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1 flex items-center gap-2">
            Active
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
