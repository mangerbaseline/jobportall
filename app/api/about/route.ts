import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { CheckAuth } from "@/utility/checkAuth";

// PUBLIC - Main site fetch active about us
export async function GET() {
    try {
        const about = await prisma.aboutUs.findFirst({ where: { isActive: true } })
        if (!about) {
            return NextResponse.json({ success: false, message: "No about us found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, data: about }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error", error }, { status: 500 })
    }
}

// ADMIN - Create about us
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get("Authorization")
        if (!token) return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })
        const user = await CheckAuth(token)
        if (!user || user.role !== "ADMIN") return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })

        const body = await request.json()
        const { heading, subHeading, content, mission, vision, imageUrl } = body

        if (!heading || !content) {
            return NextResponse.json({ success: false, message: "Heading and content are required" }, { status: 400 })
        }

        const about = await prisma.aboutUs.create({
            data: { heading, subHeading, content, mission, vision, imageUrl }
        })

        return NextResponse.json({ success: true, data: about }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error", error }, { status: 500 })
    }
}