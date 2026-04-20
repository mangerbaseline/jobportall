import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckAuth } from "@/utility/checkAuth";

export async function GET(request: NextRequest) {
  try {
    const tokenCookie = request.cookies.get("token");
    if (!tokenCookie?.value) {
      return NextResponse.json({ success: false, status: 401 });
    }
    
    const decoded: any = await CheckAuth(tokenCookie.value);
    if (!decoded) {
      return NextResponse.json({ success: false, status: 401 });
    }
    const userId = decoded.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const professionalDetails = await prisma.professionalDetail.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      data: professionalDetails ? [professionalDetails] : [],
    });
  } catch (error) {
    console.error("Error fetching professional details:", error);
    return NextResponse.json(
      { error: error || "Failed to fetch professional details" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token");
    const userCheck = await CheckAuth(token?.value);

    if (!userCheck || !userCheck.id || userCheck.role !== "USER") {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const userId = userCheck.id as string;

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

    const user = await prisma.user.findUnique({
      where: { id: userId, deleted: false },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingDetail = await prisma.professionalDetail.findUnique({
      where: { userId },
    });

    let professionalDetail;
    if (existingDetail) {
      professionalDetail = await prisma.professionalDetail.update({
        where: { userId },
        data: {
          title,
          companyName,
          experience: experience ? parseInt(experience) : null,
          skills,
          education,
          certifications,
          currentSalary: currentSalary ? parseInt(currentSalary) : null,
          expectedSalary: expectedSalary ? parseInt(expectedSalary) : null,
          noticePeriod: noticePeriod ? parseInt(noticePeriod) : null,
          resume,
          linkedin,
          github,
          portfolio,
        },
      });
    } else {
      professionalDetail = await prisma.professionalDetail.create({
        data: {
          userId,
          title,
          companyName,
          experience: experience ? parseInt(experience) : null,
          skills,
          education,
          certifications,
          currentSalary: currentSalary ? parseInt(currentSalary) : null,
          expectedSalary: expectedSalary ? parseInt(expectedSalary) : null,
          noticePeriod: noticePeriod ? parseInt(noticePeriod) : null,
          resume,
          linkedin,
          github,
          portfolio,
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
