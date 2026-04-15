import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckAuth } from "@/utility/checkAuth";

// GET /api/user/personal?userId=xxx - Get personal details
export async function GET(request: NextRequest) {
  try {
    const tokenCookie = request.cookies.get("token");
    //console.log(tokenCookie)
    if (!tokenCookie?.value) {
      return NextResponse.json({
        success: false,
        status: 401,
      });
    }
    const decoded: any = await CheckAuth(tokenCookie.value);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        status: 401,
      });
    }
    const userId = decoded.id;
    ////console.log("decode ---", decoded)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all personal details (history)
    const personalDetails = await prisma.personalDetail.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: personalDetails,
      count: personalDetails.length,
    });
  } catch (error) {
    console.error("Error fetching personal details:", error);
    return NextResponse.json(
      { error: error || "Failed to fetch personal details" },
      { status: 500 },
    );
  }
}

// POST /api/user/personal - Create new personal detail
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.cookies.get("token");
    const userCheck = await CheckAuth(token?.value);
    const userId = userCheck.id;
    if (userCheck.role !== "USER") {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }
    const {
      phone,
      address,
      city,
      state,
      country,
      zipCode,
      dob,
      gender,
      bio,
      avatar,
      website,
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ error: "user is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId, deleted: false },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create personal detail
    const personalDetail = await prisma.personalDetail.create({
      data: {
        userId,
        phone,
        address,
        city,
        state,
        country,
        zipCode,
        dob: dob ? new Date(dob) : undefined,
        gender,
        bio,
        avatar,
        website,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Personal detail created successfully",
        data: personalDetail,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating personal detail:", error);
    return NextResponse.json(
      { error: error || "Failed to create personal detail" },
      { status: 500 },
    );
  }
}
