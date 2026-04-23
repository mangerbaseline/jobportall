import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const [titlesRaw, locationsRaw, allJobsWithTags] = await Promise.all([
      prisma.job.findMany({
        where: {
          available: true,
          ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
        },
        select: { title: true },
        distinct: ["title"],
        orderBy: { title: "asc" },
        take: 10,
      }),
      prisma.job.findMany({
        where: {
          available: true,
          ...(q ? { location: { contains: q, mode: "insensitive" } } : {}),
        },
        select: { location: true },
        distinct: ["location"],
        orderBy: { location: "asc" },
        take: 10,
      }),
      prisma.job.findMany({
        where: { available: true },
        select: { tags: true },
      }),
    ]);

    const uniqueTags = Array.from(
      new Set(allJobsWithTags.flatMap((j) => j.tags))
    ).sort();

    return NextResponse.json({
      titles: titlesRaw.map((j) => j.title),
      locations: locationsRaw.map((j) => j.location),
      tags: uniqueTags,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
