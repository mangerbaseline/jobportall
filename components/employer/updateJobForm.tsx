"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  // Fetch existing job data and pre-fill the form
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
      <Card className="w-full sm:max-w-7xl shadow-xl my-2">
        <CardContent className="p-8">
          <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full sm:max-w-7xl shadow-xl transition-all duration-300 my-2">
      <CardHeader>
        <CardTitle>Update Job</CardTitle>
        <CardDescription>Edit the details of this job posting.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="update-job-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Title */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="update-job-title">Job Title</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="update-job-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="eg. HR"
                    autoComplete="off"
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
                    <FieldLabel htmlFor="update-job-vacancy">
                      Vacancy
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="update-job-vacancy"
                      aria-invalid={fieldState.invalid}
                      placeholder="eg. 5"
                      autoComplete="off"
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
                    <FieldLabel htmlFor="update-job-location">
                      Location
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="update-job-location"
                      aria-invalid={fieldState.invalid}
                      placeholder="eg. Remote / New York"
                      autoComplete="off"
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
                  <FieldLabel htmlFor="update-job-salary">Salary</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="update-job-salary"
                    aria-invalid={fieldState.invalid}
                    placeholder="eg. 80000"
                    autoComplete="off"
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
                  <FieldLabel htmlFor="update-job-description">
                    Description
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      value={field.value ?? ""}
                      id="update-job-description"
                      placeholder="Enter the job description..."
                      rows={6}
                      className="min-h-32 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {(field.value ?? "").length}/1000 characters
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
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button
            className="bg-blue-600"
            type="submit"
            form="update-job-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Job"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
