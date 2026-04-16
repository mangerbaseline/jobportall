"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  FileText,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  title: z
    .string()
    .min(3, "Job title must be at least 3 characters.")
    .max(50, "Job title must be at most 50 characters."),
  vacancy: z.string().min(1, "Vacancy is required."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(1000, "Description must be at most 1000 characters."),
  location: z.string().min(2, "Location must be at least 2 characters."),
  salary: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateJobFormProps {
  jobId: string;
}

export function UpdateJobForm({ jobId }: UpdateJobFormProps) {
  const router = useRouter();
  const [isFetching, setIsFetching] = React.useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      vacancy: "",
      description: "",
      location: "",
      salary: "",
    },
  });

  const { isSubmitting } = form.formState;

  React.useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      setIsFetching(true);
      try {
        const res = await fetch(`/api/job/${jobId}`, {
          credentials: "include",
        });

        const result = await res.json();

        if (!res.ok) {
          toast.error(result.message || "Failed to load job data.");
          return;
        }

        const job = result.data;
        form.reset({
          title: job.title ?? "",
          vacancy: String(job.vacancy ?? ""),
          description: job.description ?? "",
          location: job.location ?? "",
          salary: job.salary != null ? String(job.salary) : "",
        });
      } catch {
        toast.error("Network error. Could not load job data.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchJob();
  }, [jobId, form]);

  async function onSubmit(data: FormValues) {
    try {
      const res = await fetch(`/api/employ/job/update/${jobId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          vacancy: data.vacancy,
          description: data.description,
          location: data.location,
          salary: data.salary || "",
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to update job.");
        return;
      }

      toast.success("Job updated successfully!", {
        duration: 4000,
        description: "Your changes are now live.",
        closeButton: true,
      });
      router.push("/employer");
    } catch {
      toast.error("Network error. Please try again.");
    }
  }

  if (isFetching) {
    return (
      <div className="glass-card rounded-3xl p-8 w-full space-y-4 animate-pulse">
        <div className="h-6 bg-white/8 rounded-lg w-1/3" />
        <div className="h-3 bg-white/5 rounded-lg w-1/2" />
        <div className="space-y-4 mt-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-11 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-8 shadow-2xl shadow-black/30 w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/12 transition-all duration-200"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Update Job</h2>
            <p className="text-xs text-white/45 mt-0.5">
              Edit the details of this job posting.
            </p>
          </div>
        </div>
      </div>

      <form id="update-job-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          {/* Job Title */}
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="update-job-title"
                  className="text-white/70 text-sm font-semibold mb-1.5 flex items-center gap-2"
                >
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  Job Title
                </FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  id="update-job-title"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. Senior Frontend Engineer"
                  autoComplete="off"
                  className="bg-white/5 border-white/12 focus:border-indigo-500/60 focus:ring-indigo-500/20 text-white placeholder-white/30 rounded-xl"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Vacancy + Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="vacancy"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="update-job-vacancy"
                    className="text-white/70 text-sm font-semibold mb-1.5 flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Vacancies
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="update-job-vacancy"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. 5"
                    autoComplete="off"
                    className="bg-white/5 border-white/12 focus:border-indigo-500/60 focus:ring-indigo-500/20 text-white placeholder-white/30 rounded-xl"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="location"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="update-job-location"
                    className="text-white/70 text-sm font-semibold mb-1.5 flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    Location
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="update-job-location"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. Remote / New York"
                    autoComplete="off"
                    className="bg-white/5 border-white/12 focus:border-indigo-500/60 focus:ring-indigo-500/20 text-white placeholder-white/30 rounded-xl"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* Salary */}
          <Controller
            name="salary"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="update-job-salary"
                  className="text-white/70 text-sm font-semibold mb-1.5 flex items-center gap-2"
                >
                  <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                  Salary Range
                </FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  id="update-job-salary"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. $80,000"
                  autoComplete="off"
                  className="bg-white/5 border-white/12 focus:border-indigo-500/60 focus:ring-indigo-500/20 text-white placeholder-white/30 rounded-xl"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="update-job-description"
                  className="text-white/70 text-sm font-semibold mb-1.5 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Job Description
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    value={field.value ?? ""}
                    id="update-job-description"
                    placeholder="Describe responsibilities, requirements, and benefits…"
                    rows={6}
                    className="min-h-36 resize-none bg-white/5 border-white/12 focus:border-indigo-500/60 text-white placeholder-white/30 rounded-xl"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums text-white/40 text-xs">
                      {(field.value ?? "").length}/1000
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {/* Submit */}
        <div className="border-t border-white/8 mt-8 pt-6">
          <button
            type="submit"
            form="update-job-form"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl brand-gradient text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 hover:opacity-90 hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
