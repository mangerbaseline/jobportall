import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckAuth } from "@/utility/checkAuth";
import { success } from "zod";

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("token");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const decodedToken = await CheckAuth(token);

        if (!decodedToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (decodedToken.role !== "EMPLOYER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = decodedToken.id;
        const employerJob = await prisma.job.findMany({
            where: {
                employerId: userId,
            }
        });
        return NextResponse.json({ success: true, employerJob }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to Fetch your Jobs" }, { status: 500 });
    }
}

