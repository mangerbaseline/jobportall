import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        password: true,
        deleted: true,
        professional: {
          omit: {
            createdAt: true,
            updatedAt: true,
            userId: true,

          }
        },
        personal: {
          omit: {
            createdAt: true,
            updatedAt: true,
            userId: true,
          }
        }
      },
    });
    if (!user || !user.password)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );

    if (user.deleted) {
      return NextResponse.json(
        {
          error:
            "This account has been blocked by the organization for not complying with the terms and conditions.",
        },
        { status: 403 },
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );

    const token = signToken({ id: user.id, role: user.role });

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        professional: user.professional,
        personal: user.personal

      },
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}
