import { prisma } from "@/lib/prisma";
import { CheckAuth } from "@/utility/checkAuth";
import { NextResponse, NextRequest } from "next/server";
import { findNextAvailableSlot } from "@/lib/schedule";
import { sendInterviewEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = req.cookies.get("token");
    const user = await CheckAuth(token?.value);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    if (user.role !== "EMPLOYER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    let update = "REJECTED";
    try {
      const body = await req.json();
      update = body.status || body.update || "REJECTED";
    } catch (err) {
      update = "REJECTED";
    }

    const { id } = await params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message: "There is no application exist with this id!",
        },
        { status: 404 },
      );
    }

    // Verify ownership
    if (user.role === "EMPLOYER" && application.job.employerId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    if (update === "ACCEPTED") {
      // ── Step 1: Find the next available interview slot ──
      const slot = await findNextAvailableSlot(application.job.employerId);

      if (!slot) {
        return NextResponse.json(
          {
            success: false,
            message:
              "All interview slots are fully booked for the next 30 days.",
          },
          { status: 409 },
        );
      }

      // ── Step 2: Transaction — accept app + mark employed + create interview ──
      const [updatedApplication, , interview] = await prisma.$transaction([
        prisma.application.update({
          where: { id },
          data: { status: "ACCEPTED" },
        }),
        prisma.user.update({
          where: { id: application.userId },
          data: { employed: true },
        }),
        prisma.interview.create({
          data: {
            scheduledDate: slot.scheduledDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            applicationId: id,
            employerId: application.job.employerId,
          },
        }),
      ]);

      // ── Step 3: Send interview email (non-blocking) ──
      const companyName = application.job.company?.name || "Our Company";

      sendInterviewEmail({
        candidateEmail: application.user.email,
        candidateName: application.user.name,
        jobTitle: application.job.title,
        companyName: companyName,
        scheduledDate: slot.scheduledDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }).catch((err) => console.error("Failed to send interview email:", err));

      return NextResponse.json(
        {
          success: true,
          application: updatedApplication,
          interview: {
            date: slot.scheduledDate,
            time: `${slot.startTime} – ${slot.endTime}`,
          },
        },
        { status: 201 },
      );
    } else {
      const updatedApplication = await prisma.application.update({
        where: { id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json(
        { success: true, application: updatedApplication },
        { status: 200 },
      );
    }
  } catch (error) {
    console.log("Error : ", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error ",
      },
      { status: 500 },
    );
  }
}
