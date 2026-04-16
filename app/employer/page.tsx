"use client";
import { useEffect } from "react";
import { useAppSelector } from "@/lib/hook/hook";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import EmployerDashboard from "@/components/employer/dashboard";

export default function Employer() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    if (user.loading) return;
    if (user.role === "USER") {
      router.push("/user");
    }
  }, [user.role, user.loading, router]);

  if (user.loading) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }
  return <EmployerDashboard />;
}
