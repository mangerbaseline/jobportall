import { NextRequest, NextResponse } from "next/server";
import { CheckAuth } from "@/utility/checkAuth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await CheckAuth(token);
    if (!decoded || decoded.role !== "EMPLOYER" || !decoded.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, logoUrl, website } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 },
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        description,
        logoUrl,
        website,
        userId: decoded.id,
      },
    });

    return NextResponse.json({ success: true, data: company }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await CheckAuth(token);
    if (!decoded || decoded.role !== "EMPLOYER" || !decoded.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      where: { userId: decoded.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      { success: true, data: companies },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
