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
    //console.log("token : ", token);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not Authorized" },
        { status: 401 },
      );
    }
    //remove ""
    const user = await CheckAuth(token.value);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not Authorized ." },
        { status: 401 },
      );
    }

    const existingJob = await prisma.job.findUnique({
      where: { id: id },
    });

    if (!existingJob) {
      return NextResponse.json(
        { success: false, message: "No job found with this ID" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: existingJob },
      { status: 200 },
    );
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
