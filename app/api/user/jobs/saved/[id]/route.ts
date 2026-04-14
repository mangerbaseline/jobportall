import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { CheckAuth } from "@/utility/checkAuth";

//remove job from save.

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: " id is needed in params." },
        { status: 400 },
      );
    }

    ////console.log(id)

    //validate token is here
    const token = request.headers.get("Authorization");
    ////console.log("tere is no toke : ", token)
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not Authorized" },
        { status: 401 },
      );
    }
    //user is user
    const user = await CheckAuth(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not Authorized" },
        { status: 401 },
      );
    }

    // if (!user.id) {
    //     return NextResponse.json({ success: false, message: "No user Id is provided in token ." }, { status: 400 })
    // }
    // const verifyUser = await prisma.savedJob.findUnique({ where: { id: id }, select: { userId: true } })

    // if (user.id !== verifyUser?.userId) {
    //     return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    // }

    //save data
    const SavedJobs = await prisma.savedJob.findMany({
      where: {
        userId: id,
      },
    });
    return NextResponse.json({ success: true, data: SavedJobs });
  } catch (error) {
    ////console.log(`Error from  : ${request.url} the error is ${error}`)
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error },
      { status: 500 },
    );
  }
}
