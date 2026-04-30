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
  Tag,
} from "lucide-react";
import { useAppDispatch } from "@/lib/hook/hook";
import { postJob } from "@/lib/features/user/profileDetail";
import {
  Field,
  FieldDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  title: z
    .string()
    .min(3, "Job title must be at least 3 characters.")
    .max(50, "Job title must be at most 50 characters."),
  vacancy: z
    .string()
    .min(1, "Vacancy is required.")
    .regex(/^\d+$/, "Vacancy must be a number."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(1000, "Description must be at most 1000 characters."),
  location: z.string().min(2, "Location must be at least 2 characters."),
  salary: z.string().min(1, "Salary is required."),
  companyId: z.string().optional(),
  tags: z.string().optional(),
});

interface CreatePostFormProps {
  onClose?: () => void;
}

export function CreatePostForm({ onClose }: CreatePostFormProps = {}) {
  const dispatch = useAppDispatch();
  const [companies, setCompanies] = React.useState<any[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/employer/company")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setCompanies(res.data);
        }
      })
      .finally(() => setIsLoadingCompanies(false));
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      vacancy: "",
      description: "",
      location: "",
      salary: "",
      companyId: "",
      tags: "",
    },
  });
  const { isSubmitting } = form.formState;

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const processedData = {
      ...data,
      tags: data.tags
        ? data.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag !== "")
        : [],
    };
    const result = await dispatch(postJob(processedData));

    if (postJob.fulfilled.match(result)) {
      toast.success("Job posted successfully", {
        duration: 4000,
        description: "Your job is now live.",
        closeButton: true,
      });
      form.reset();
      onClose?.();
    } else {
      const errMsg =
        (result.payload as string) || "Failed to post job";
      toast.error(errMsg);
    }
  }

  return (
    <div className="glass-card rounded-3xl p-8 shadow-2xl w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Post a New Job</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fill in the details below — your listing goes live instantly.
          </p>
        </div>
      </div>

      <form id="create-post-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          {/* Company Selection */}
          <Controller
            name="companyId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="create-post-company"
                  className="text-muted-foreground text-sm font-semibold mb-1.5 flex items-center gap-2"
                >
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  Company
                </FieldLabel>
                <Select
                  disabled={isLoadingCompanies || companies.length === 0}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger 
                    className="w-full bg-muted border-border focus:border-primary focus:ring-ring text-foreground rounded-xl h-11"
                  >
                    <SelectValue placeholder={isLoadingCompanies ? "Loading companies..." : (companies.length === 0 ? "No companies available" : "Select a company")} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id} className="hover:bg-accent focus:bg-accent focus:text-foreground cursor-pointer">
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Job Title */}
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="create-post-title"
                  className="text-muted-foreground text-sm font-semibold mb-1.5 flex items-center gap-2"
                >
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  Job Title
                </FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  id="create-post-title"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. Senior Frontend Engineer"
                  autoComplete="off"
                  className="bg-muted border-border focus:border-primary focus:ring-ring text-foreground placeholder:text-muted-foreground/30 rounded-xl"
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
                    htmlFor="create-post-vacancy"
                    className="text-muted-foreground text-sm font-semibold mb-1.5 flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Vacancies
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="create-post-vacancy"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. 5"
                    autoComplete="off"
                    className="bg-muted border-border focus:border-primary focus:ring-ring text-foreground placeholder:text-muted-foreground/30 rounded-xl"
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
                    htmlFor="create-post-location"
                    className="text-muted-foreground text-sm font-semibold mb-1.5 flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    Location
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="create-post-location"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. Remote / New York"
                    autoComplete="off"
                    className="bg-muted border-border focus:border-primary focus:ring-ring text-foreground placeholder:text-muted-foreground/30 rounded-xl"
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
                  htmlFor="create-post-salary"
                  className="text-muted-foreground text-sm font-semibold mb-1.5 flex items-center gap-2"
                >
                  <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                  Salary Range
                </FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  id="create-post-salary"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. $50k – $80k / year"
                  autoComplete="off"
                  className="bg-muted border-border focus:border-primary focus:ring-ring text-foreground placeholder:text-muted-foreground/30 rounded-xl"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Tags */}
          <Controller
            name="tags"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="create-post-tags"
                  className="text-muted-foreground text-sm font-semibold mb-1.5 flex items-center gap-2"
                >
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  Tags (comma separated)
                </FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  id="create-post-tags"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. React, Next.js, TypeScript"
                  autoComplete="off"
                  className="bg-muted border-border focus:border-primary focus:ring-ring text-foreground placeholder:text-muted-foreground/30 rounded-xl"
                />
                <FieldDescription className="text-muted-foreground/50 text-xs mt-1">
                  Separate tags with commas to help candidates find your job.
                </FieldDescription>
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
                  htmlFor="create-post-description"
                  className="text-muted-foreground text-sm font-semibold mb-1.5 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Job Description
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    value={field.value ?? ""}
                    id="create-post-description"
                    placeholder="Describe responsibilities, requirements, and benefits…"
                    rows={6}
                    className="min-h-36 resize-none bg-muted border-border focus:border-primary text-foreground placeholder:text-muted-foreground/30 rounded-xl"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums text-muted-foreground/40 text-xs">
                      {field.value.length}/1000
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription className="text-muted-foreground/50 text-xs mt-1">
                  Include responsibilities, required skills, and benefits.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {/* Divider */}
        <div className="border-t border-border mt-8 pt-6">
          <button
            type="submit"
            form="create-post-form"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl brand-gradient text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 hover:opacity-90 hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing Job…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Publish Job Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
