import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CheckAuth } from '@/utility/checkAuth';

// GET /api/user/professional?userId=xxx - Get professional details
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const token = request.headers.get("Authorization");
        const auth = await CheckAuth(token)
        if (auth.role !== "USER") {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
        }
        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            )
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId, deleted: false }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Get all professional details (history)
        const professionalDetails = await prisma.professionalDetail.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({
            success: true,
            data: professionalDetails,
            count: professionalDetails.length
        })

    } catch (error) {
        console.error('Error fetching professional details:', error)
        return NextResponse.json(
            { error: 'Failed to fetch professional details' },
            { status: 500 }
        )
    }
}

// POST /api/user/professional - Create new professional detail
export async function POST(request: Request) {
    try {
        const token = request.headers.get("Authorization");
        const auth = await CheckAuth(token)
        if (auth.role !== "USER") {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
        }
        const body = await request.json()
        const userId = auth.id
        const {

            title,
            company,
            experience,
            skills,
            education,
            certifications,
            currentSalary,
            expectedSalary,
            noticePeriod,
            resume,
            linkedin,
            github,
            portfolio
        } = body

        // Validate required fields
        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            )
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId, deleted: false }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Create professional detail
        const professionalDetail = await prisma.professionalDetail.create({
            data: {
                userId,
                title,
                company,
                experience,
                skills,
                education,
                certifications,
                currentSalary,
                expectedSalary,
                noticePeriod,
                resume,
                linkedin,
                github,
                portfolio
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Professional detail created successfully',
            data: professionalDetail
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating professional detail:', error)
        return NextResponse.json(
            { error: 'Failed to create professional detail' },
            { status: 500 }
        )
    }
}

// PUT /api/user/professional - Update professional detail
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const {
            id,
            title,
            company,
            experience,
            skills,
            education,
            certifications,
            currentSalary,
            expectedSalary,
            noticePeriod,
            resume,
            linkedin,
            github,
            portfolio
        } = body

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            )
        }

        // Check if professional detail exists
        const existingDetail = await prisma.professionalDetail.findUnique({
            where: { id }
        })

        if (!existingDetail) {
            return NextResponse.json(
                { error: 'Professional detail not found' },
                { status: 404 }
            )
        }

        // Update professional detail
        const professionalDetail = await prisma.professionalDetail.update({
            where: { id },
            data: {
                title,
                company,
                experience,
                skills,
                education,
                certifications,
                currentSalary,
                expectedSalary,
                noticePeriod,
                resume,
                linkedin,
                github,
                portfolio
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Professional detail updated successfully',
            data: professionalDetail
        })

    } catch (error) {
        console.error('Error updating professional detail:', error)
        return NextResponse.json(
            { error: 'Failed to update professional detail' },
            { status: 500 }
        )
    }
}

// DELETE /api/user/professional?id=xxx - Delete professional detail
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

        // Check if professional detail exists
        const existingDetail = await prisma.professionalDetail.findUnique({
            where: { id }
        })

        if (!existingDetail) {
            return NextResponse.json(
                { error: 'Professional detail not found' },
                { status: 404 }
            )
        }

        // Delete professional detail
        await prisma.professionalDetail.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Professional detail deleted successfully'
        })

    } catch (error) {
        console.error('Error deleting professional detail:', error)
        return NextResponse.json(
            { error: 'Failed to delete professional detail' },
            { status: 500 }
        )
    }
}