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
            },
            include: {
                applications: {
                    select: {
                        id: true,
                        resumeUrl: true,
                        status: true,
                        createdAt: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                                personal: {
                                    select: {
                                        phone: true,
                                        address: true,
                                        city: true,
                                        state: true,
                                        country: true,
                                        zipCode: true,
                                        dob: true,
                                        gender: true,
                                        bio: true,
                                        avatar: true,
                                        website: true,
                                    }
                                },
                                professional: {
                                    select: {
                                        title: true,
                                        experience: true,
                                        skills: true,
                                        education: true,
                                        certifications: true,
                                        currentSalary: true,
                                        expectedSalary: true,
                                        noticePeriod: true,
                                        resume: true,
                                        linkedin: true,
                                        github: true,
                                        portfolio: true,
                                        companyName: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return NextResponse.json({ success: true, employerJob }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to Fetch your Jobs" }, { status: 500 });
    }
}

