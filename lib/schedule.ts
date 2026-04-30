import { prisma } from "@/lib/prisma";

const MAX_INTERVIEWS_PER_DAY = 10;
const SLOT_DURATION_MINUTES = 45;
const DAY_START_HOUR = 9;  // 9 AM
const DAY_END_HOUR = 17;   // 5 PM
const MAX_DAYS_AHEAD = 30; // search up to 30 days ahead

/**
 * Generates all possible 45-minute time slots for a given day
 * from DAY_START_HOUR to DAY_END_HOUR.
 */
function generateTimeSlots(): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = [];

  let currentMinutes = DAY_START_HOUR * 60; // 540  (9:00)
  const endMinutes = DAY_END_HOUR * 60;     // 1020 (17:00)

  while (currentMinutes + SLOT_DURATION_MINUTES <= endMinutes) {
    const startH = Math.floor(currentMinutes / 60)
      .toString()
      .padStart(2, "0");
    const startM = (currentMinutes % 60).toString().padStart(2, "0");

    const endTotal = currentMinutes + SLOT_DURATION_MINUTES;
    const endH = Math.floor(endTotal / 60)
      .toString()
      .padStart(2, "0");
    const endM = (endTotal % 60).toString().padStart(2, "0");

    slots.push({ start: `${startH}:${startM}`, end: `${endH}:${endM}` });

    currentMinutes = endTotal; // no gap — back-to-back slots
  }

  return slots;
}

/**
 * Finds the next available interview slot within the next MAX_DAYS_AHEAD days.
 * Enforces:
 *   1. Max 10 interviews per employer per day
 *   2. No overlapping time slots on the same day for the same employer
 *
 * Returns { scheduledDate, startTime, endTime } or null if nothing is available.
 */
export async function findNextAvailableSlot(employerId: string): Promise<{
  scheduledDate: Date;
  startTime: string;
  endTime: string;
} | null> {
  const allSlots = generateTimeSlots();
  const today = new Date();
  // Start from the next business day (at least tomorrow)
  today.setDate(today.getDate() + 1);

  for (let dayOffset = 0; dayOffset < MAX_DAYS_AHEAD; dayOffset++) {
    const candidate = new Date(today);
    candidate.setDate(candidate.getDate() + dayOffset);

    // Skip weekends
    const dow = candidate.getDay();
    if (dow === 0 || dow === 6) continue;

    // Normalize to start of day (UTC)
    const dayStart = new Date(candidate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(candidate);
    dayEnd.setHours(23, 59, 59, 999);

    // Count how many interviews this employer already has on this day
    const existingInterviews = await prisma.interview.findMany({
      where: {
        employerId,
        scheduledDate: { gte: dayStart, lte: dayEnd },
        status: { not: "CANCELLED" },
      },
      select: { startTime: true, endTime: true },
    });

    // Enforce daily limit
    if (existingInterviews.length >= MAX_INTERVIEWS_PER_DAY) continue;

    // Build a set of already-booked start times
    const bookedStarts = new Set(existingInterviews.map((i) => i.startTime));

    // Find the first open slot
    for (const slot of allSlots) {
      if (!bookedStarts.has(slot.start)) {
        return {
          scheduledDate: dayStart,
          startTime: slot.start,
          endTime: slot.end,
        };
      }
    }
  }

  // All days are fully booked for the next MAX_DAYS_AHEAD days
  return null;
}
