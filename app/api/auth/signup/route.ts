import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { success } from "zod";

export async function POST(req: NextRequest) {
  try {
    const hasToken = req.cookies.get("token")?.value;
    if (hasToken)
      return NextResponse.json({ error: "Already logged in" }, { status: 400 });

    const { name, email, password, role, companyName } = await req.json();

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
    let User: any = {
      id: crypto.randomUUID(),
      name: name,
      email: email,
      password: hashed,
      role: role,
    };

    if (role === "EMPLOYER") {
      User.companyName = companyName;
    }

    const user = await prisma.user.create({
      data: User,
    });
    ////console.log("its here : ", user);

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
