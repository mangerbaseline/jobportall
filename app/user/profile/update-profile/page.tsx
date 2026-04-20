import React from "react";
import PersonalDetailsForm from "@/components/user/personalDetailUpdate";
import ProfessionalDetailsForm from "@/components/user/professionalDetailUpdate";

export default function page() {
  return (
    <div className="mt-20 pb-20 space-y-12">
      <PersonalDetailsForm />
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-px w-full bg-border/50"></div>
      </div>

      <ProfessionalDetailsForm />
    </div>
  );
}
