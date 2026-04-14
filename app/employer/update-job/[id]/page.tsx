import React from "react";
import { UpdateJobForm } from "@/components/employer/updateJobForm";

interface UpdateJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function UpdateJob({ params }: UpdateJobPageProps) {
  const { id } = await params;

  return (
    <>
      <div className="flex flex-col mt-20 gap-8 p-4">
        <span className="text-3xl text-gray-900 font-bold">Update Job</span>
        <UpdateJobForm jobId={id} />
      </div>
    </>
  );
}
