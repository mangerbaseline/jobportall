import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token");
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token.value);
    if (!decoded || decoded.role !== "EMPLOYER")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token");
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token.value);
    if (!decoded || decoded.role !== "EMPLOYER")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, description, logoUrl, website } = await req.json();

    if (!name)
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );

    const company = await prisma.company.create({
      data: {
        name,
        description,
        logoUrl,
        website,
        userId: decoded.id,
      },
    });

    return NextResponse.json(
      { success: true, data: company },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
