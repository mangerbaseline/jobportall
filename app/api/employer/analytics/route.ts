import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckAuth } from "@/utility/checkAuth";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = (await CheckAuth(token)) as jwt.JwtPayload;
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is an employer
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true },
    });

    if (!user || (user.role !== "EMPLOYER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Fetch all jobs for this employer with application counts
    const jobs = await prisma.job.findMany({
      where: { employerId: user.id },
      select: {
        id: true,
        title: true,
        location: true,
        salary: true,
        views: true,
        vacancy: true,
        available: true,
        createdAt: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate per-job analytics
    const jobAnalytics = jobs.map((job) => {
      const applications = job._count.applications;
      const views = job.views;
      const conversionRate =
        views > 0 ? Math.round((applications / views) * 10000) / 100 : 0;

      return {
        id: job.id,
        title: job.title,
        location: job.location,
        salary: job.salary,
        vacancy: job.vacancy,
        available: job.available,
        createdAt: job.createdAt,
        views,
        applications,
        conversionRate,
      };
    });

    // Calculate aggregate stats
    const totalViews = jobAnalytics.reduce((sum, j) => sum + j.views, 0);
    const totalApplications = jobAnalytics.reduce(
      (sum, j) => sum + j.applications,
      0
    );
    const avgConversionRate =
      totalViews > 0
        ? Math.round((totalApplications / totalViews) * 10000) / 100
        : 0;

    // Find top performers
    const mostViewedJob = jobAnalytics.length
      ? jobAnalytics.reduce((max, j) => (j.views > max.views ? j : max))
      : null;

    const highestConvertingJob = jobAnalytics.length
      ? jobAnalytics
          .filter((j) => j.views >= 5) // minimum threshold
          .reduce(
            (max, j) =>
              j.conversionRate > (max?.conversionRate ?? 0) ? j : max,
            null as (typeof jobAnalytics)[0] | null
          )
      : null;

    // Application status breakdown
    const statusBreakdown = await prisma.application.groupBy({
      by: ["status"],
      where: { employerId: user.id },
      _count: { status: true },
    });

    const statusCounts = {
      pending: 0,
      accepted: 0,
      rejected: 0,
    };
    statusBreakdown.forEach((item) => {
      const key = item.status.toLowerCase() as keyof typeof statusCounts;
      statusCounts[key] = item._count.status;
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalJobs: jobAnalytics.length,
          totalViews,
          totalApplications,
          avgConversionRate,
          statusCounts,
        },
        highlights: {
          mostViewedJob: mostViewedJob
            ? { title: mostViewedJob.title, views: mostViewedJob.views }
            : null,
          highestConvertingJob: highestConvertingJob
            ? {
                title: highestConvertingJob.title,
                conversionRate: highestConvertingJob.conversionRate,
              }
            : null,
        },
        jobs: jobAnalytics,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
