import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { CheckAuth } from "@/utility/checkAuth";

// ADMIN - Update / activate a policy version
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 })

        const token = request.headers.get("Authorization")
        if (!token) return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })
        const user = await CheckAuth(token)
        if (!user || user.role !== "ADMIN") return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })

        const existing = await prisma.privacyPolicy.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 })

        const body = await request.json()
        const { version, title, content, effectiveAt, isActive } = body

        // If activating this version, deactivate all others first
        if (isActive) {
            await prisma.$transaction([
                prisma.privacyPolicy.updateMany({ where: { isActive: true }, data: { isActive: false } }),
                prisma.privacyPolicy.update({ where: { id }, data: { version, title, content, effectiveAt: effectiveAt ? new Date(effectiveAt) : undefined, isActive } })
            ])
        } else {
            await prisma.privacyPolicy.update({
                where: { id },
                data: { version, title, content, effectiveAt: effectiveAt ? new Date(effectiveAt) : undefined, isActive }
            })
        }

        const updated = await prisma.privacyPolicy.findUnique({ where: { id } })
        return NextResponse.json({ success: true, data: updated }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error", error }, { status: 500 })
    }
}

// ADMIN - Delete a policy version
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 })

        const token = request.headers.get("Authorization")
        if (!token) return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })
        const user = await CheckAuth(token)
        if (!user || user.role !== "ADMIN") return NextResponse.json({ success: false, message: "Not Authorized" }, { status: 401 })

        const existing = await prisma.privacyPolicy.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 })

        if (existing.isActive) {
            return NextResponse.json({ success: false, message: "Cannot delete an active policy. Activate another version first." }, { status: 400 })
        }

        await prisma.privacyPolicy.delete({ where: { id } })

        return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error", error }, { status: 500 })
    }
}