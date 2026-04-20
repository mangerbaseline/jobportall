"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

function Applicant() {
  const { id } = useParams();
  useEffect(() => {
    async function fetchApplicant() {
      try {
        const res = await fetch(`/api/application/${id}`);
        if (!res.ok) return;
        const data = res.json();
        console.log(await data);
      } catch (error) {
        return;
      }
    }
    fetchApplicant();
  }, []);
  return <div>Applicant</div>;
}

export default Applicant;
