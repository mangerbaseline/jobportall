import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { CheckAuth } from "@/utility/checkAuth";

export async function PATCH(
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

    ////console.log(id)

    const token = request.headers.get("Authorization");
    ////console.log("tere is no toke : ", token)
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not Authorized" },
        { status: 401 },
      );
    }
    const user = await CheckAuth(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not Authorized" },
        { status: 401 },
      );
    }
    if (user.role !== "EMPLOYER") {
      return NextResponse.json(
        { success: false, message: "Not Authorized" },
        { status: 401 },
      );
    }

    const AvailableStatus = await prisma.job.findUnique({
      where: { id: id },
      select: { title: true, available: true, employerId: true },
    });

    ////console.log("--Available Statis : --", AvailableStatus)
    if (!AvailableStatus) {
      return NextResponse.json(
        { success: false, message: "No job find by this id" },
        { status: 400 },
      );
    }

    if (AvailableStatus.employerId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const updateStatus = await prisma.job.update({
      where: { id: id },
      data: { available: !AvailableStatus.available },
    });

    return NextResponse.json(
      { success: true, data: updateStatus },
      { status: 200 },
    );
  } catch (error) {
    ////console.log("Internal-server-error : ", error)
    return NextResponse.json(
      { success: false, message: "internal server error", error: error },
      { status: 500 },
    );
  }
}
