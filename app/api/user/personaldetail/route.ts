import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckAuth } from "@/utility/checkAuth";
import cloudinary from "@/lib/cloudinary/cloudinary";

// GET /api/user/personal?userId=xxx - Get personal details
export async function GET(request: NextRequest) {
  try {
    let tokenCookie = request.cookies.get("token")?.value;
    if (!tokenCookie) {
      tokenCookie = request.headers.get('token') || "";
    }
    //console.log(tokenCookie)
    if (!tokenCookie) {
      return NextResponse.json({
        success: false,
        status: 401,
      });
    }
    const decoded: any = await CheckAuth(tokenCookie);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        status: 401,
      });
    }
    const userId = decoded.id;
    ////console.log("decode ---", decoded)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all personal details (history)
    const personalDetails = await prisma.personalDetail.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: personalDetails,
      count: personalDetails.length,
    });
  } catch (error) {
    console.error("Error fetching personal details:", error);
    return NextResponse.json(
      { error: error || "Failed to fetch personal details" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token and authenticate user
    const token = request.cookies.get("token");
    const userCheck = await CheckAuth(token?.value);

    if (!userCheck || userCheck.role !== "USER") {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const userId = userCheck.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId should be provided" },
        { status: 400 },
      );
    }

    // Parse form data
    const formData = await request.formData();

    // Extract text fields
    const phone = (formData.get("phone") as string) || null;
    const address = (formData.get("address") as string) || null;
    const city = (formData.get("city") as string) || null;
    const state = (formData.get("state") as string) || null;
    const country = (formData.get("country") as string) || null;
    const zipCode = (formData.get("zipcode") as string) || null;
    const dob = (formData.get("dob") as string) || null;
    const gender = (formData.get("gender") as string) || null;
    const bio = (formData.get("bio") as string) || null;
    const website = (formData.get("website") as string) || null;

    // Handle avatar file upload
    const avatarFile = formData.get("avatar") as File | null;
    let avatarUrl: string | null = null;

    if (avatarFile && avatarFile.size > 0) {
      // Convert file to buffer
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const uploadResponse: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              folder: "user_avatars",
              allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(buffer);
      });

      avatarUrl = uploadResponse.secure_url;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId, deleted: false },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if personal detail already exists
    const existingDetail = await prisma.personalDetail.findUnique({
      where: { userId },
    });

    // Use upsert or manual check to handle update vs create
    let personalDetail;
    if (existingDetail) {
      personalDetail = await prisma.personalDetail.update({
        where: { userId },
        data: {
          phone,
          address,
          city,
          state,
          country,
          zipCode,
          dob: dob ? new Date(dob) : null,
          gender,
          bio,
          avatar: avatarUrl || existingDetail.avatar, // keep old avatar if new one not provided
          website,
        },
      });
    } else {
      personalDetail = await prisma.personalDetail.create({
        data: {
          userId,
          phone,
          address,
          city,
          state,
          country,
          zipCode,
          dob: dob ? new Date(dob) : null,
          gender,
          bio,
          avatar: avatarUrl,
          website,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: existingDetail
          ? "Personal detail updated successfully"
          : "Personal detail created successfully",
        data: personalDetail,
      },
      { status: existingDetail ? 200 : 201 },
    );
  } catch (error) {
    console.error("Error creating personal detail:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create personal detail",
      },
      { status: 500 },
    );
  }
}
