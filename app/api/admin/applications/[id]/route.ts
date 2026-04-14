import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

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

    if (decoded.role !== "ADMIN")
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

    if (decoded.role !== "ADMIN")
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
