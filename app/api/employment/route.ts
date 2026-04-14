import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { CheckAuth } from "@/utility/checkAuth";

// USER - Get my employment detail
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get("Authorization")
        if (!token) return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })

        const user = await CheckAuth(token)
        if (!user) return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })

        const employment = await prisma.application.findFirst({
            where: {
                userId: user.id,
                status: "ACCEPTED"
            },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        location: true,
                        salary: true,
                        employer: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        })

        if (!employment) {
            return NextResponse.json({ success: false, message: "No employment found" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: {
                jobId: employment.job.id,
                jobTitle: employment.job.title,
                location: employment.job.location,
                salary: employment.job.salary,
                employedAt: employment.createdAt,
                employer: employment.job.employer
            }
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error", error }, { status: 500 })
    }
}