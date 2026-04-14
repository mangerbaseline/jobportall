import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckAuth } from "@/utility/checkAuth";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, status: 401 });
    }

    const { id } = (await CheckAuth(token)) as jwt.JwtPayload;
    if (!id) {
      return NextResponse.json({ success: false, status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json(
      { success: true, user, message: "User fetched successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
