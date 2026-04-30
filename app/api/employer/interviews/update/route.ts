import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { InterviewStatus } from "@/generated/prisma/enums";

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token");
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token.value);
    if (!decoded || decoded.role !== "EMPLOYER")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { interviewId, status, notes } = await req.json();

    if (!interviewId || !status) {
      return NextResponse.json(
        { error: "interviewId and status are required" },
        { status: 400 }
      );
    }

    // Validate status value against the enum
    const validStatuses: InterviewStatus[] = ["SCHEDULED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch the interview and verify the employer owns the associated job
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: {
            job: {
              select: { employerId: true },
            },
          },
        },
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Ensure the logged-in employer is the one who created the job
    if (interview.application.job.employerId !== decoded.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only update interviews for your own jobs" },
        { status: 403 }
      );
    }

    // Build update data — notes is optional
    const updateData: { status: InterviewStatus; notes?: string } = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: updateData,
    });

    return NextResponse.json(
      { success: true, data: updatedInterview },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating interview:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
