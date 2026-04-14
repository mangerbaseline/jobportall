import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { CheckAuth } from "@/utility/checkAuth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Job id is needed in params." },
        { status: 400 },
      );
    }

    const token = request.cookies.get("token");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not Authorized" },
        { status: 401 },
      );
    }

    const user = await CheckAuth(token.value);
    if (!user || user.role !== "EMPLOYER") {
      return NextResponse.json(
        { success: false, message: "Not Authorized or not an Employer" },
        { status: 401 },
      );
    }

    const existingJob = await prisma.job.findUnique({
      where: { id: id },
      select: { employerId: true },
    });

    if (!existingJob) {
      return NextResponse.json(
        { success: false, message: "No job found with this ID" },
        { status: 404 },
      );
    }

    if (existingJob.employerId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You don't own this job" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { title, vacancy, description, location, salary, available } = body;

    // Basic validation for numeric fields if they are provided
    if (vacancy !== undefined && isNaN(Number(vacancy))) {
      return NextResponse.json(
        { success: false, message: "Vacancy must be a valid number" },
        { status: 400 },
      );
    }

    if (salary !== undefined && salary !== "" && isNaN(Number(salary))) {
      return NextResponse.json(
        { success: false, message: "Salary must be a valid number" },
        { status: 400 },
      );
    }

    const updatedJob = await prisma.job.update({
      where: { id: id },
      data: {
        ...(title !== undefined && { title }),
        ...(vacancy !== undefined && { vacancy: Number(vacancy) }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(salary !== undefined && { salary: salary === "" ? null : Number(salary) }),
        ...(available !== undefined && { available }),
      },
    });

    return NextResponse.json(
      { success: true, message: "Job updated successfully", data: updatedJob },
      { status: 200 },
    );
  } catch (error) {
    console.error("Job update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
