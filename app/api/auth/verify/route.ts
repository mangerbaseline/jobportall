import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is missing" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    if (user.tokenExpires && new Date(user.tokenExpires) < new Date()) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verificationToken: null,
        tokenExpires: null,
      },
    });

    // Redirect to a success page or the profile page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get("host")}`;
    return NextResponse.redirect(`${baseUrl}/user/profile?verified=true`);
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
