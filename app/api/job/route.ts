import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    // const token = req.cookies.get("token");
    // if (!token)
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // const decoded = await verifyToken(token.value);
    // if (!decoded)
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const search = searchParams.get("search") || "";
    const title = searchParams.get("title") || "";
    const location = searchParams.get("location") || "";
    const tags = searchParams.get("tags") || "";
    const skip = (page - 1) * limit;

    const where: any = { available: true };
    
    const andConditions: any[] = [];

    if (tags) {
      const tagList = tags.split(",").map(t => t.trim());
      andConditions.push({ tags: { hasSome: tagList } });
    }

    if (search) {
      // 1. Fetch all tags to find case-insensitive and partial matches
      const allJobsWithTags = await prisma.job.findMany({
        where: { available: true },
        select: { tags: true },
      });
      const uniqueTags = Array.from(new Set(allJobsWithTags.flatMap(j => j.tags)));
      const matchedTags = uniqueTags.filter(tag => 
        tag.toLowerCase().includes(search.toLowerCase())
      );

      // 2. Build the OR condition
      const searchOrConditions: any[] = [
        { title: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];

      // Add tag matching only if we found matching tags (hasSome with empty array matches nothing)
      if (matchedTags.length > 0) {
        searchOrConditions.push({ tags: { hasSome: matchedTags } });
      }

      andConditions.push({ OR: searchOrConditions });
    }

    if (title) {
      andConditions.push({ title: { contains: title, mode: "insensitive" } });
    }

    if (location) {
      andConditions.push({ location: { contains: location, mode: "insensitive" } });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      job: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err || "Server error" }, { status: 500 });
  }
}
