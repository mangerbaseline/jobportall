import { prisma } from "@/lib/prisma";

export type NotificationType =
    | "APPLICATION_STATUS"
    | "INTERVIEW_SCHEDULED"
    | "GENERAL";

export interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    applicationId?: string; // optional — links the notification to a specific application
}

export async function createNotification({
    userId,
    title,
    message,
    type,
    applicationId,
}: CreateNotificationParams): Promise<void> {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                ...(applicationId && { applicationId }),
            },
        });
    } catch (error) {
        // Log but don't throw — a failed notification must never break the main request
        console.error("Failed to create notification:", error);
    }
}
