"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hook/hook";
import {
  fetchUserDetail,
  clearUserDetail,
} from "@/lib/features/user/profileDetail";
import { User as UserIcon, Briefcase, ShieldCheck } from "lucide-react";

export default function UserDetail() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  // read from Redux, not local state
  const { data, loading, error } = useAppSelector((state) => state.details);

  useEffect(() => {
    if (!user.id) return;

    dispatch(fetchUserDetail(user.id));

    return () => {
      dispatch(clearUserDetail()); // cleanup on unmount
    };
  }, [user.id, dispatch]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-3 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
        <div className="mt-6 flex gap-4">
          <div className="flex-1 h-12 bg-white/10 rounded-xl"></div>
          <div className="flex-1 h-12 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-7xl p-6 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-md text-red-400 text-sm">
        Error loading profile: {error || "User not found"}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl p-6 rounded-2xl border border-gray-200 bg-white/5 backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-gray-200">
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-300">
            {data.personal?.avatar ? (
              <img
                src={data.personal.avatar}
                alt={data.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-10 h-10 text-black/40" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-4 border-[#0a0a0a] flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl text-gray-700 font-bold bg-clip-text bg-gradient-to-r from-white to-white/60 truncate">
            {data.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 tracking-wider uppercase">
              <ShieldCheck className="w-3 h-3 mr-1" />
              {data.role}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="p-4 rounded-xl bg-white/5 border-2 border-dashed border-gray-600 flex flex-col gap-1 transition-colors hover:bg-white/10">
          <div className="flex items-center gap-2 text-black/40 text-xs font-medium">
            <Briefcase className="w-3.5 h-3.5" />
            Jobs Posted
          </div>
          <div className="text-2xl font-semibold text-gray-600">
            {data._count.jobs}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border-2 border-dashed border-gray-600 flex flex-col gap-1 transition-colors hover:bg-white/10">
          <div className="flex items-center gap-2 text-black/40 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Status
          </div>
          <div className="text-2xl font-semibold text-green-400 flex items-center gap-1.5 leading-none">
            Active
            <span className="flex h-2 w-2 rounded-full bg-green-400"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
