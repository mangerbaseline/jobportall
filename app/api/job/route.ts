import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    //take from header
    const token = req.headers.get("Authorization");
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    ////console.log("---Decoded-----:",decoded)

    if (decoded.role === "USER")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const job = await prisma.job.findMany();

    return NextResponse.json({ job }, { status: 201 });
  } catch (err) {
    ////console.log(err)
    return NextResponse.json({ error: err || "Server error" }, { status: 500 });
  }
}
