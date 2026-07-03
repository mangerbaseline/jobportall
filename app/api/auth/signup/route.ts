import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { sendVerificationEmail } from "@/lib/email";
import { sendRegistrationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, companyName, parsedResumeData } = await req.json();

    if (!name || !email || !password || !role)
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );

    if (role !== "USER" && role !== "EMPLOYER")
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );

    if (role === "EMPLOYER" && !companyName) {
      return NextResponse.json(
        { error: "Company Name is required." },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    let User: any = {
      id: crypto.randomUUID(),
      name: name,
      email: email,
      password: hashed,
      role: role,
      verificationToken,
      tokenExpires,
    };

    if (role === "EMPLOYER") {
      User.companyName = companyName;
      User.companies = {
        create: {
          name: companyName,
        },
      };
    }

    if (role === "USER" && parsedResumeData) {
      User.personal = {
        create: {
          phone: parsedResumeData.phone || null,
          bio: parsedResumeData.bio || null,
          website: parsedResumeData.portfolio || null,
        },
      };
      User.professional = {
        create: {
          title: parsedResumeData.title || null,
          experience: parsedResumeData.experience ? parseInt(parsedResumeData.experience) : null,
          skills: parsedResumeData.skills || [],
          education: parsedResumeData.education || null,
          certifications: parsedResumeData.certifications || null,
          linkedin: parsedResumeData.linkedin || null,
          github: parsedResumeData.github || null,
          portfolio: parsedResumeData.portfolio || null,
        },
      };
    }

    const user = await prisma.user.create({
      data: User,
    });
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get("host")}`;
    
    // Send both emails (Registration success and Verification)
    await Promise.all([
      sendRegistrationEmail(
        {
          name: user.name,
          email: user.email,
          role: user.role,
        },
        baseUrl,
      ),
      sendVerificationEmail(user.email, verificationToken, baseUrl),
    ]);

    const token = signToken({ id: user.id, role: user.role });

    ////console.log("its here at token : ", token);
    const response = NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyName: user.companyName,
        },
      },
      { status: 201 },
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}
