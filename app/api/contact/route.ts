import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { CheckAuth } from "@/utility/checkAuth";

// PUBLIC - User submits contact form
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, phone, subject, message } = body

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ success: false, message: "Name, email, subject and message are required" }, { status: 400 })
        }

        const contact = await prisma.contactUs.create({
            data: { name, email, phone, subject, message }
        })

        return NextResponse.json({ success: true, data: contact }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error", error }, { status: 500 })
    }
}

// ADMIN - Get all contact submissions
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get("Authorization")
        if (!token) return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })
        const user = await CheckAuth(token)
        if (!user || user.role !== "ADMIN") return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })

        const contacts = await prisma.contactUs.findMany({ orderBy: { createdAt: "desc" } })

        return NextResponse.json({ success: true, data: contacts }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error", error }, { status: 500 })
    }
}