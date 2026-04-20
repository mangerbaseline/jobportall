import { prisma } from "@/lib/prisma";
import { CheckAuth } from "@/utility/checkAuth";
import { NextResponse, NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = req.cookies.get("token");
    const user = await CheckAuth(token?.value);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    if (user.role !== "EMPLOYER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    let update = "REJECTED";
    try {
      const body = await req.json();
      update = body.status || body.update || "REJECTED";
    } catch (err) {
      // Body might be empty, default to REJECTED as per requirements
      update = "REJECTED";
    }

    const { id } = await params;

    const existApplication = await prisma.application.findUnique({
      where: { id },
    });

    if (!existApplication) {
      return NextResponse.json(
        {
          success: false,
          message: "There is no application exist with this id!",
        },
        { status: 404 },
      );
    }

    if (update === "ACCEPTED") {
      const application = await prisma.application.update({
        where: { id },
        data: { status: "ACCEPTED" },
      });
      return NextResponse.json({ success: true, application }, { status: 201 });
    } else {
      const application = await prisma.application.update({
        where: { id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ success: true, application }, { status: 200 });
    }
  } catch (error) {
    console.log("Errror : ", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error ",
      },
      { status: 500 },
    );
  }
}
