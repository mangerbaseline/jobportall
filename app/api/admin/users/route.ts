import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users - Get all users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    // Filter parameters
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    
    
    // Build where clause
    const where: any = {}
    
    // Filter by role
    if (role && ['USER', 'ADMIN', 'EMPLOYER'].includes(role)) {
      where.role = role
    }
    
    // Search by name or email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Include soft-deleted users or not
   
    
    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              jobs: true,
              applications: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])
    
    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    })
    
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch users' 
      },
      { status: 500 }
    )
  }
}