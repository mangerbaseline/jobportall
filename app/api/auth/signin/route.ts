import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password)
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password)
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

        const token = signToken({ id: user.id, role: user.role });

        const response = NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        response.cookies.set('token',token,{
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        })
        return  response 
    } catch (err) {
        return NextResponse.json({ error: err || "Server error" }, { status: 500 });
    }
}