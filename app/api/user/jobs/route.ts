import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckAuth } from "@/utility/checkAuth";

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
        const userId = decodedToken.id;
        const savedJobs = await prisma.application.findMany({
            where: {
                userId: userId,
            },
            include: {
                job: true,
            },
        });
        return NextResponse.json({ savedJobs });
    } catch (error) {
        return NextResponse.json({ error: "Failed to Fetch you Application applied" }, { status: 500 });
    }
}

