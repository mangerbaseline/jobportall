"use client"
import Navbar from "@/components/navbar"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hook/hook"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user)

  useEffect(() => {
    if (user.role === "EMPLOYER") {
      router.push("/employer");
    }
  }, [user.role, router]);


  if (user.loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="mt-20 mx-4 text-2xl font-medium">
        Welcome {user.name || "User"}
      </div>
    </div>
  );
}