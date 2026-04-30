"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hook/hook";
import {
  fetchInterviews,
  updateInterview,
} from "@/lib/features/employer/interviewSlice";
import GradientBlobs from "@/components/bg/gradientblobs";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Loader2,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

type InterviewStatusType = "SCHEDULED" | "COMPLETED" | "CANCELLED";

function UpdateStatusDialog({
  interviewId,
  currentStatus,
  currentNotes,
}: {
  interviewId: string;
  currentStatus: InterviewStatusType;
  currentNotes: string | null;
}) {
  const dispatch = useAppDispatch();
  const { updating } = useAppSelector((state) => state.interviews);

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<InterviewStatusType>(currentStatus);
  const [notes, setNotes] = useState(currentNotes || "");
  const [localError, setLocalError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setStatus(currentStatus);
      setNotes(currentNotes || "");
      setLocalError(null);
    }
  }, [open, currentStatus, currentNotes]);

  const handleSubmit = async () => {
    setLocalError(null);
    const payload: {
      interviewId: string;
      status: InterviewStatusType;
      notes?: string;
    } = { interviewId, status };

    if (notes.trim()) {
      payload.notes = notes.trim();
    }

    const result = await dispatch(updateInterview(payload));

    if (updateInterview.fulfilled.match(result)) {
      setOpen(false);
    } else {
      setLocalError((result.payload as string) || "Failed to update interview");
    }
  };

  const statusOptions: {
    value: InterviewStatusType;
    label: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      value: "SCHEDULED",
      label: "Scheduled",
      icon: <AlertCircle className="w-4 h-4" />,
      color:
        "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400",
    },
    {
      value: "COMPLETED",
      label: "Completed",
      icon: <CheckCircle2 className="w-4 h-4" />,
      color:
        "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    },
    {
      value: "CANCELLED",
      label: "Cancelled",
      icon: <XCircle className="w-4 h-4" />,
      color: "border-destructive/30 bg-destructive/5 text-destructive",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="cursor-pointer bg-[#815ef4] hover:bg-[#6d4ad4] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0">
          Update Status
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-lg font-semibold text-foreground">
          Update Interview Status
        </DialogTitle>

        <div className="space-y-5 mt-2">
          {/* Status Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    status === opt.value
                      ? `${opt.color} ring-2 ring-offset-2 ring-offset-background ring-current`
                      : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30"
                  }`}
                >
                  {opt.icon}
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Notes{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this interview..."
              rows={3}
              className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Error */}
          {localError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
              {localError}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={updating}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={updating}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {updating && <Loader2 className="w-4 h-4 animate-spin" />}
              {updating ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EmployerSchedulePage() {
  const dispatch = useAppDispatch();
  const { interviews, loading, error } = useAppSelector(
    (state) => state.interviews,
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format helpers
  const getToday = () => new Date();
  const getTomorrow = () => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    return tmrw;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  useEffect(() => {
    const offset = selectedDate.getTimezoneOffset();
    const adjustedDate = new Date(selectedDate.getTime() - offset * 60 * 1000);
    const dateString = adjustedDate.toISOString().split("T")[0];
    dispatch(fetchInterviews({ date: dateString }));
  }, [selectedDate, dispatch]);

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const dateParts = e.target.value.split("-");
      if (dateParts.length === 3) {
        const localDate = new Date(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2]),
        );
        setSelectedDate(localDate);
      }
    }
  };

  return (
    <div className="min-h-screen">
      <GradientBlobs />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Interview <span className="brand-text">Schedule</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view your upcoming candidate interviews.
            </p>
          </div>

          {/* Date Filters */}
          <div className="flex items-center gap-3 bg-card p-1.5 rounded-xl border border-border">
            <button
              onClick={() => setSelectedDate(getToday())}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSameDay(selectedDate, getToday())
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(getTomorrow())}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSameDay(selectedDate, getTomorrow())
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              Tomorrow
            </button>
            <div className="w-px h-6 bg-border mx-1"></div>
            <div className="relative flex items-center">
              <CalendarDays className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
              <input
                type="date"
                value={
                  mounted
                    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
                    : ""
                }
                onChange={handleDateSelect}
                className="pl-9 pr-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-center">
            {error}
          </div>
        ) : interviews.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Interviews Scheduled
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You don't have any interviews scheduled for{" "}
              {mounted
                ? selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : "this day"}
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white font-bold shrink-0">
                      {interview.application.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-foreground font-semibold truncate max-w-[150px]">
                        {interview.application.user.name}
                      </h4>
                      <p className="text-xs text-primary">
                        {interview.application.job.title}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      interview.status === "SCHEDULED"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : interview.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    {interview.status}
                  </span>
                </div>

                <div className="space-y-3 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>
                      {interview.startTime} - {interview.endTime}
                    </span>
                  </div>

                  {interview.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="truncate">{interview.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4 text-primary" />
                    <div className="flex justify-between items-center w-full gap-2">
                      <a
                        href={`mailto:${interview.application.user.email}`}
                        className="hover:text-primary transition-colors truncate"
                      >
                        {interview.application.user.email}
                      </a>
                      <UpdateStatusDialog
                        interviewId={interview.id}
                        currentStatus={interview.status}
                        currentNotes={interview.notes}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

//irdq qqdp lqaj aiyj
//jobportal
