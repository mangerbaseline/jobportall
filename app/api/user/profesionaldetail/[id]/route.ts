import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckAuth } from "@/utility/checkAuth";

// GET /api/user/professional?userId=xxx - Get professional details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = (await params).id;
    const token = request.headers.get("token");
    const auth = await CheckAuth(token);
    if (!auth || auth.role !== "USER" || !auth.id) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId, deleted: false },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all professional details (history)
    const professionalDetails = await prisma.professionalDetail.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: professionalDetails,
      count: professionalDetails.length,
    });
  } catch (error) {
    console.error("Error fetching professional details:", error);
    return NextResponse.json(
      { error: "Failed to fetch professional details" },
      { status: 500 },
    );
  }
}

// POST /api/user/profesionaldetail/[id] - Create or update professional detail
export async function POST(request: NextRequest) {
  try {
    let token = request.cookies.get("token")?.value;
    if (!token) {
      token = request.headers.get("token") || "";
    }
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }
    const auth = await CheckAuth(token);
    if (!auth || !auth.id || auth.role !== "USER") {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }
    const userId = auth.id as string;
    const body = await request.json();
    const {
      title,
      companyName,
      experience,
      skills,
      education,
      certifications,
      currentSalary,
      expectedSalary,
      noticePeriod,
      resume,
      linkedin,
      github,
      portfolio,
    } = body;

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: { id: userId, deleted: false },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingDetail = await prisma.professionalDetail.findUnique({
      where: { userId },
    });

    const detailData = {
      title,
      companyName,
      experience: experience ? parseInt(String(experience)) : null,
      skills,
      education,
      certifications,
      currentSalary: currentSalary ? parseInt(String(currentSalary)) : null,
      expectedSalary: expectedSalary ? parseInt(String(expectedSalary)) : null,
      noticePeriod: noticePeriod ? parseInt(String(noticePeriod)) : null,
      resume,
      linkedin,
      github,
      portfolio,
    };

    let professionalDetail;
    if (existingDetail) {
      professionalDetail = await prisma.professionalDetail.update({
        where: { userId },
        data: detailData,
      });
    } else {
      professionalDetail = await prisma.professionalDetail.create({
        data: {
          userId,
          ...detailData,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: existingDetail
          ? "Professional detail updated successfully"
          : "Professional detail created successfully",
        data: professionalDetail,
      },
      { status: existingDetail ? 200 : 201 },
    );
  } catch (error) {
    console.error("Error saving professional details:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save professional details",
      },
      { status: 500 },
    );
  }
}

// PUT /api/user/professional - Update professional detail
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    let token = request.cookies.get("token")?.value;
    if (!token) {
      token = request.headers.get("token") || "";
    }
    const auth = await CheckAuth(token);
    if (auth.role !== "USER") {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }
    const userId = auth.id;
    const {
      id,
      title,
      companyName,
      experience,
      skills,
      education,
      certifications,
      currentSalary,
      expectedSalary,
      noticePeriod,
      resume,
      linkedin,
      github,
      portfolio,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Check if professional detail exists
    const existingDetail = await prisma.professionalDetail.findUnique({
      where: { id },
    });

    if (!existingDetail) {
      return NextResponse.json(
        { error: "Professional detail not found" },
        { status: 404 },
      );
    }

    // Update professional detail
    const professionalDetail = await prisma.professionalDetail.update({
      where: { id },
      data: {
        title,
        companyName,
        experience,
        skills,
        education,
        certifications,
        currentSalary,
        expectedSalary,
        noticePeriod,
        resume,
        linkedin,
        github,
        portfolio,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Professional detail updated successfully",
      data: professionalDetail,
    });
  } catch (error) {
    console.error("Error updating professional detail:", error);
    return NextResponse.json(
      { error: "Failed to update professional detail" },
      { status: 500 },
    );
  }
}

// DELETE /api/user/professional?id=xxx - Delete professional detail
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Check if professional detail exists
    const existingDetail = await prisma.professionalDetail.findUnique({
      where: { id },
    });

    if (!existingDetail) {
      return NextResponse.json(
        { error: "Professional detail not found" },
        { status: 404 },
      );
    }

    // Delete professional detail
    await prisma.professionalDetail.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Professional detail deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting professional detail:", error);
    return NextResponse.json(
      { error: "Failed to delete professional detail" },
      { status: 500 },
    );
  }
}
