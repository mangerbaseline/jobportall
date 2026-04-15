"use client";
import React from "react";
import USER from "@/components/employer/user";
import { useAppSelector } from "@/lib/hook/hook";
import { useRouter } from "next/navigation";

export default function Employer() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  if (user.role === "EMPLOYER") {
    router.push("/user");
  }
  return (
    <div className="w-full  mt-20 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6  lg:px-8 lg:py-2">
        <USER />
      </div>
    </div>
  );
}
