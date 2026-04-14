import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token");
    if (!token) {
      return NextResponse.json({
        success: false,
        message: "Unable to access token.",
        status: 401,
      });
    }
    const res = NextResponse.json({ success: true });
    res.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });
    return res;
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
