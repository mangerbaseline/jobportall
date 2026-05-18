import { CheckAuth } from "@/utility/checkAuth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — Fetch all notifications for the authenticated user
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get("token") || "";
        if (!token) {
            return NextResponse.json({ success: false, message: "Missing token" }, { status: 400 });
        }

        const user = await CheckAuth(token);
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized user" }, { status: 401 });
        }

        // Fetch all notifications for this user, newest first
        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        // Count how many are unread so the mobile app can show a badge
        const unreadCount = notifications.filter((n) => !n.isRead).length;

        return NextResponse.json(
            { success: true, notifications, unreadCount },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

// PATCH — Mark one or all notifications as read
export async function PATCH(request: NextRequest) {
    try {
        const token = request.headers.get("token") || "";
        if (!token) {
            return NextResponse.json({ success: false, message: "Missing token" }, { status: 400 });
        }

        const user = await CheckAuth(token);
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized user" }, { status: 401 });
        }

        // notificationId is optional — if provided, mark only that one as read
        const body = await request.json().catch(() => ({}));
        const { notificationId } = body;

        if (notificationId) {
            // Mark a single notification as read (only if it belongs to this user)
            await prisma.notification.update({
                where: { id: notificationId, userId: user.id },
                data: { isRead: true },
            });
        } else {
            // Mark ALL unread notifications for this user as read
            await prisma.notification.updateMany({
                where: { userId: user.id, isRead: false },
                data: { isRead: true },
            });
        }

        return NextResponse.json(
            { success: true, message: "Notifications marked as read" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating notifications:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}