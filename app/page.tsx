"use client";
import Navbar from "@/components/navbar";
import { HomeCard } from "@/components/home/seek";
import { useAppSelector } from "@/lib/hook/hook";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div>
      <Navbar />
      <div className="mt-20 mx-4 text-2xl font-medium">
        Welcome to Job portal
      </div>
      <div className="flex flex-row m-4 gap-4">
        <HomeCard seek="Seeker" link="/user" />
        <HomeCard postJob="Post Job" link="/employer" />
      </div>
    </div>
  );
}
