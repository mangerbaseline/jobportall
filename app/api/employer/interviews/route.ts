import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token");
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token.value);
    if (!decoded || decoded.role !== "EMPLOYER")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    // Parse the date (assuming format YYYY-MM-DD or parseable ISO string)
    const targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Define start and end of the day for filtering
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const interviews = await prisma.interview.findMany({
      where: {
        employerId: decoded.id,
        scheduledDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        application: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            job: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(
      { success: true, data: interviews },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching employer interviews:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
