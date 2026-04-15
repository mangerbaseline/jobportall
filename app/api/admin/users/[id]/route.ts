import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckAuth } from "@/utility/checkAuth";

//is deleted
// GET /api/users/[id] - Get user by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Build where clause
    const where: any = { id };

    const user = await prisma.user.findUnique({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        verified: true,
        employed: true,
        savedJobs: true,
        deleted: false,
        jobs: {
          select: {
            id: true,
            title: true,
            vacancy: true,
            location: true,
            salary: true,
            createdAt: true,
            _count: {
              select: { applications: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        applications: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            job: {
              select: {
                id: true,
                title: true,
                location: true,
                salary: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        professional: true,
        personal: true,
        _count: {
          select: {
            jobs: true,
            applications: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check if user exists and not already deleted
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        deleted: false,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found or already deleted",
        },
        { status: 404 },
      );
    }

    // Soft delete - set deleted flag to true
    const deletedUser = await prisma.user.update({
      where: { id },
      data: { deleted: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        deleted: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User soft deleted successfully",
        user: deletedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error soft deleting user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
      },
      { status: 500 },
    );
  }
}
