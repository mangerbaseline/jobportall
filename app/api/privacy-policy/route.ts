import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { CheckAuth } from "@/utility/checkAuth";

// PUBLIC - Get active privacy policy
export async function GET() {
    try {
        const policy = await prisma.privacyPolicy.findFirst({ where: { isActive: true } })
        if (!policy) {
            return NextResponse.json({ success: false, message: "No active policy found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, data: policy }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error", error }, { status: 500 })
    }
}

// ADMIN - Create new policy version
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get("Authorization")
        if (!token) return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })
        const user = await CheckAuth(token)
        if (!user || user.role !== "ADMIN") return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })

        const body = await request.json()
        const { version, title, content, effectiveAt } = body

        if (!version || !title || !content || !effectiveAt) {
            return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
        }

        const policy = await prisma.privacyPolicy.create({
            data: { version, title, content, effectiveAt: new Date(effectiveAt) }
        })

        return NextResponse.json({ success: true, data: policy }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error", error }, { status: 500 })
    }
}