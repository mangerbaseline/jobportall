import { NextRequest, NextResponse } from "next/server";
import { CheckAuth } from "@/utility/checkAuth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get("token");
        if (!token) {
            return NextResponse.json({ success: false, status: 401 });
        }
        const user = await CheckAuth(token);
        const data = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                role: true,
                name: true,
                email: true,
                ...(user.role === "EMPLOYER" && {
                    companies: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            logoUrl: true,
                            website: true,
                        }
                    }
                })
            }
        })
        if (!user) {
            return NextResponse.json({ success: false, status: 401 })
        }
        return NextResponse.json({ success: true, user: data, message: "User fetched successfully." }, { status: 200 });
    } catch (error) {
        console.log("error: ", error)
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}