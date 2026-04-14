import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { CheckAuth } from "@/utility/checkAuth";

// ADMIN - Add note to contact submission
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 })

        const token = request.headers.get("Authorization")
        if (!token) return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })
        const user = await CheckAuth(token)
        if (!user || user.role !== "ADMIN") return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })

        const existing = await prisma.contactUs.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 })

        const body = await request.json()
        const { adminNote } = body

        const updated = await prisma.contactUs.update({
            where: { id },
            data: { adminNote }
        })

        return NextResponse.json({ success: true, data: updated }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error", error }, { status: 500 })
    }
}

// ADMIN - Delete contact submission
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 })

        const token = request.headers.get("Authorization")
        if (!token) return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })
        const user = await CheckAuth(token)
        if (!user || user.role !== "ADMIN") return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })

        const existing = await prisma.contactUs.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 })

        await prisma.contactUs.delete({ where: { id } })

        return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error", error }, { status: 500 })
    }
}