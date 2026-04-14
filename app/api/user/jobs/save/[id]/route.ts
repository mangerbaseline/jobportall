import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { CheckAuth } from "@/utility/checkAuth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    //validate there is id in param
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Job id is needed in params." },
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
    if (user.role !== "USER") {
      return NextResponse.json(
        { success: false, message: "Not Authorized" },
        { status: 401 },
      );
    }

    if (!user.id) {
      return NextResponse.json(
        { success: false, message: "No user Id is provided in token ." },
        { status: 400 },
      );
    }

    //take userid from the user parasm and jobiD from the params
    const createSave = await prisma.savedJob.create({
      data: { userId: user.id!, jobId: id },
    });

    return NextResponse.json({ success: true, createSave }, { status: 200 });
  } catch (error) {
    ////console.log(`URL : ${request.url} error is ${error} `)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
}

//remove job from save.

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "saved Job id is needed in params." },
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
    if (user.role !== "USER") {
      return NextResponse.json(
        { success: false, message: "Not Authorized" },
        { status: 401 },
      );
    }

    if (!user.id) {
      return NextResponse.json(
        { success: false, message: "No user Id is provided in token ." },
        { status: 400 },
      );
    }
    const verifyUser = await prisma.savedJob.findUnique({
      where: { id: id },
      select: { userId: true },
    });
    if (!verifyUser) {
      return NextResponse.json({
        success: false,
        message: "No saved Job fron this id",
      });
    }
    ////console.log("🔍 : ",verifyUser)
    if (user.id !== verifyUser?.userId) {
      ////console.log("User id : " ,user.id)
      ////console.log("actual id : " ,verifyUser?.userId)
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    //save data
    const deleted = await prisma.savedJob.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(
      { success: false, data: deleted },
      { status: 200 },
    );
  } catch (error) {}
}
