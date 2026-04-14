// PUT /api/user/personal - Update personal detail
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CheckAuth } from '@/utility/checkAuth';

type RouteContext = {
    params: Promise<{ id: string }>;
};
export async function PUT(request: Request, context: RouteContext) {
    try {
        const body = await request.json()
        const token = request.headers.get("Authorization");
        const userCheck = await CheckAuth(token)
        if (userCheck.role !== "USER") {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
        }
        const { id } = await context.params
        const {
            phone,
            address,
            city,
            state,
            country,
            zipCode,
            dob,
            gender,
            bio,
            avatar,
            website
        } = body

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            )
        }

        // Check if personal detail exists
        const existingDetail = await prisma.personalDetail.findUnique({
            where: { id }
        })

        if (!existingDetail) {
            return NextResponse.json(
                { error: 'Personal detail not found' },
                { status: 404 }
            )
        }

        // Update personal detail
        const personalDetail = await prisma.personalDetail.update({
            where: { id },
            data: {
                phone,
                address,
                city,
                state,
                country,
                zipCode,
                dob: dob ? new Date(dob) : undefined,
                gender,
                bio,
                avatar,
                website
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Personal detail updated successfully',
            data: personalDetail
        })

    } catch (error) {
        console.error('Error updating personal detail:', error)
        return NextResponse.json(
            { error: 'Failed to update personal detail' },
            { status: 500 }
        )
    }
}

// DELETE /api/user/personal?id=xxx - Delete personal detail
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            )
        }

        // Check if personal detail exists
        const existingDetail = await prisma.personalDetail.findUnique({
            where: { id }
        })

        if (!existingDetail) {
            return NextResponse.json(
                { error: 'Personal detail not found' },
                { status: 404 }
            )
        }

        // Delete personal detail
        await prisma.personalDetail.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Personal detail deleted successfully'
        })

    } catch (error) {
        console.error('Error deleting personal detail:', error)
        return NextResponse.json(
            { error: 'Failed to delete personal detail' },
            { status: 500 }
        )
    }
}