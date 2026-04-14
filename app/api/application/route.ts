import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeUrl, jobId } = body;
    const token = req.headers.get("Authorization");
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    ////console.log("---Decoded-----:", decoded)

    if (decoded.role !== "USER")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get the employerId from the job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { employerId: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const application = await prisma.application.create({
      data: {
        resumeUrl,
        userId: decoded.id,
        jobId,
        employerId: job.employerId,
      },
      include: {
        user: true,
        job: true,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You have already applied for this job" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 },
    );
  }
}
