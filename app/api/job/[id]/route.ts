import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { CheckAuth } from "@/utility/checkAuth";

export async function GET(
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
    let user = null;

    if (token) {
      try {
        user = await CheckAuth(token.value);
      } catch (e) {
        // Ignore token errors, treat as unauthenticated
        user = null;
      }
    }

    const existingJob = await prisma.job.findUnique({
      where: { id: id },
    });

    if (!existingJob) {
      console.log("Existinfjob is missign");
      return NextResponse.json(
        { success: false, message: "No job found with this ID" },
        { status: 404 },
      );
    }

    // Increment view count (fire-and-forget, non-blocking)
    // Only count if viewer is not the employer who owns this job
    if (!user || user.id !== existingJob.employerId) {
      prisma.job.update({
        where: { id },
        data: { views: { increment: 1 } },
      }).catch(() => { }); // silently ignore errors
    }

    const [relatedJobs, Company, hasApplied] = await Promise.all([
      prisma.job.findMany({
        where: {
          id: { not: id },
          available: true,
          tags: { hasSome: existingJob.tags },
        },
        take: 6,
        select: {
          id: true,
          title: true,
          location: true,
          salary: true,
          createdAt: true,
          employer: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: existingJob.employerId },
        select: { name: true },
      }),
      user && user.id
        ? prisma.application.findUnique({
          where: {
            userId_jobId: {
              userId: user.id,
              jobId: id,
            },
          },
        })
        : Promise.resolve(null),
    ]);

    if (!Company) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Company who offers this job may be deleted or blocked by the Organization.",
        },
        { status: 404 },
      );
    }

    const Job = {
      ...existingJob,
      ...Company,
      applied: !!hasApplied,
      isLoggedIn: !!(user && user.id),
      relatedJobs: relatedJobs.map(j => ({
        ...j,
        name: j.employer.name,
        employer: undefined
      }))
    };
    console.log("job  : ", Job);
    if (!Job) {
      return NextResponse.json({
        success: false,
        status: 404,
        message: "Data for this job is not available.",
      });
    }

    return NextResponse.json({ success: true, data: Job }, { status: 200 });
  } catch (error) {
    console.error("Job update error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
