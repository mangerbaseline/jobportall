"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAppDispatch } from "@/lib/hook/hook";
import { fetchUserDetail } from "@/lib/features/user/profileDetail";

interface AddCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function AddCompanyDialog({
  open,
  onOpenChange,
  userId,
}: AddCompanyDialogProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("Company name is required");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/employer/company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, website }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create company");
      }

      // Success
      setName("");
      setDescription("");
      setWebsite("");
      onOpenChange(false);
      // Refresh user details to get the new company list or count
      dispatch(fetchUserDetail(userId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/10 sm:max-w-md bg-zinc-950">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Add New Company
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Create a new company to post jobs under its name.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/80">
              Company Name <span className="text-red-400">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/80">
              Description
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description about the company"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/80">Website</label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://acme.com"
              type="url"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              disabled={loading}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10 text-white hover:bg-white/10 hover:text-white"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="brand-gradient text-white border-0 hover:opacity-90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Company"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
