import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { CheckAuth } from "@/utility/checkAuth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Unwrap params with await
    const token = request.headers.get("Authorization");
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    ////console.log("---Decoded-----:", decoded)

    if (decoded.role !== "USER")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const jobApplication = await prisma.application.findMany({
      where: { jobId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      applications: jobApplication,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 },
    );
  }
}

// DELETE /api/applications/[id] - Delete application by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = request.headers.get("Authorization");
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    ////console.log("---Decoded-----:", decoded)

    if (decoded.role !== "USER")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    // Delete the application
    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application deleted successfully",
        deletedId: id,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting application:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 },
    );
  }
}

// EMPLOYER - Accept or Reject application
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id)
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 },
      );

    const token = request.headers.get("Authorization");
    if (!token)
      return NextResponse.json(
        { success: false, message: "Not Authorized" },
        { status: 401 },
      );

    const user = await CheckAuth(token);
    if (!user)
      return NextResponse.json(
        { success: false, message: "Not Authorized" },
        { status: 401 },
      );
    if (user.role !== "EMPLOYER")
      return NextResponse.json(
        { success: false, message: "Not Authorized" },
        { status: 401 },
      );

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 },
      );
    }

    // Make sure this employer owns the job
    if (application.job.employerId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    // Prevent changing status if already accepted or rejected
    if (application.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: `Application already ${application.status.toLowerCase()}`,
        },
        { status: 400 },
      );
    }

    const { status } = await request.json();

    if (!status || !["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status must be ACCEPTED or REJECTED" },
        { status: 400 },
      );
    }

    if (status === "ACCEPTED") {
      // transaction — accept application + mark user as employed
      const [updatedApplication] = await prisma.$transaction([
        prisma.application.update({
          where: { id },
          data: { status: "ACCEPTED" },
        }),
        prisma.user.update({
          where: { id: application.userId },
          data: { employed: true },
        }),
      ]);
      return NextResponse.json(
        { success: true, data: updatedApplication },
        { status: 200 },
      );
    }

    // REJECTED — just update application status
    const updated = await prisma.application.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error },
      { status: 500 },
    );
  }
}
