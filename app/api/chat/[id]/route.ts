import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckAuth } from "@/utility/checkAuth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ success: false, message: "User id is not provided." }, { status: 404 })
    }
    const token = req.cookies.get("token")?.value || req.headers.get("token");
    if (!token) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }
    try {
        const user = await CheckAuth(token);
        if (!user || user.id !== id) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
        }

        if (user.role === "EMPLOYER") {
            // Return accepted applicants as contacts — one per application
            const data = await prisma.application.findMany({
                where: {
                    employerId: id,
                    status: "ACCEPTED",
                },
                select: {
                    id: true,          // applicationId — used to scope the conversation
                    jobTitle: true,
                    userId: true,      // the applicant's userId (used for Socket.IO room)
                    user: {
                        select: { name: true }
                    }
                }
            });

            const contacts = data.map((app) => ({
                applicationId: app.id,
                userId: app.userId,            // socket target
                userName: app.user.name,
                jobTitle: app.jobTitle ?? "Job",
            }));

            return NextResponse.json({ success: true, data: contacts, message: "Employer contacts fetched" }, { status: 200 })
        } else {
            // Return accepted employer contacts — one per application
            const data = await prisma.application.findMany({
                where: {
                    userId: id,
                    status: "ACCEPTED",
                },
                select: {
                    id: true,          // applicationId
                    jobTitle: true,
                    employerId: true,  // the employer's userId (used for Socket.IO room)
                    employer: {
                        select: { name: true }
                    },
                    job: { select: { company: { select: { name: true } } } }
                }
            });

            const contacts = data.map((app) => ({
                applicationId: app.id,
                userId: app.employerId,        // socket target
                userName: app.employer.name,
                jobTitle: app.jobTitle ?? "Job",
                companyName: app.job.company?.name,
            }));

            return NextResponse.json({ success: true, data: contacts, message: "User contacts fetched" }, { status: 200 })
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Error 500" }, { status: 500 })
    }
}
