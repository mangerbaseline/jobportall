import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    //take from header
    const token = req.cookies.get("token");
    //console.log(token);
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token.value);
    if (!decoded)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    ////console.log("---Decoded-----:",decoded)

    if (decoded.role !== "EMPLOYER")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const Employer = decoded;

    const { title, description, location, salary, vacancy, companyId, tags } = await req.json();

    if (!title || !description || !location || !salary || !vacancy)
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );

    const job = await prisma.job.create({
      data: {
        title,
        description,
        location,
        salary: salary ? parseInt(salary) : null,
        vacancy: vacancy ? parseInt(vacancy) : 0,
        employerId: Employer.id,
        tags: tags || [],
        ...(companyId ? { companyId } : {}),
      },
      select: {
        id: true,
        title: true,
        vacancy: true,
        location: true,
        salary: true,
        createdAt: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (err) {
    //console.log(err);
    return NextResponse.json({ error: err || "Server error" }, { status: 500 });
  }
}
