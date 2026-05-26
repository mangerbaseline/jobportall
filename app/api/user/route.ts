import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckAuth } from "@/utility/checkAuth";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  //IF TOKEN 401 AXIOS CALL API --> IT WILL CHECK THE USER VALUE AND SEND ELSE IF TOKEN EXPIRE SEND 401 AND DELETE THE TOKEN FROM STORAGE
  try {
    let token = request.cookies.get("token")?.value;
    if (!token) {
      token = request.headers.get("token") as string;
    }
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
        verified: true,
        personal: {
          select: {
            avatar: true,
          },
        },
        professional: true,
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
