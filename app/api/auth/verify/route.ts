import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get("host")}`;
  
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(`${baseUrl}/user/profile?error=Verification token is missing`);
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      // If we can't find the user by token, they might already be verified
      // But we don't have the user ID to check. 
      // Redirect with a slightly more helpful message.
      return NextResponse.redirect(`${baseUrl}/user/profile?error=Invalid or already used verification token`);
    }

    if (user.tokenExpires && new Date(user.tokenExpires) < new Date()) {
      return NextResponse.redirect(`${baseUrl}/user/profile?error=Verification token has expired`);
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

    return NextResponse.redirect(`${baseUrl}/user/profile?verified=true`);
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(`${baseUrl}/user/profile?error=Internal server error`);
  }
}
