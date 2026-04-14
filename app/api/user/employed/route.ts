import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { CheckAuth } from "@/utility/checkAuth";

// PUBLIC - Get active privacy policy
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization");
    const user = await CheckAuth(token);
    ////console.log("User : ",user)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Not authenticated",
      });
    }
    if (user.role !== "EMPLOYER" && user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Not Authorized" });
    }
    const policy = await prisma.user.findMany({
      where: { employed: true },
      omit: { password: true },
    });

    if (!policy) {
      return NextResponse.json(
        { success: false, message: "No active policy found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: policy }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error },
      { status: 500 },
    );
  }
}
