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
  salary: z.string().min(1, "Salary is required."),
});

interface CreatePostFormProps {
  onClose?: () => void;
}

export function CreatePostForm({ onClose }: CreatePostFormProps = {}) {
  const form = useForm<z.infer<typeof formSchema>>({
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

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const res = await fetch("/api/job/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to post job");
        return;
      }

      toast.success("Job posted successfully", {
        duration: 4000,
        description: "Your job is now live.",
        closeButton: true,
      });
      form.reset();
      onClose?.();
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  }

  return (
    <Card className="w-full sm:max-w-7xl shadow-xl transition-all duration-300 my-2">
      <CardHeader>
        <CardTitle>Post Job</CardTitle>
        <CardDescription>
          Post Jobs for public can apply for it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">
                    Job Title
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="form-rhf-demo-title"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="vacancy"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-vacancy">Vacancy</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="form-vacancy"
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
                    <FieldLabel htmlFor="form-location">Location</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="form-location"
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

            <Controller
              name="salary"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-salary">Salary Range</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    id="form-salary"
                    aria-invalid={fieldState.invalid}
                    placeholder="eg. $50k - $80k"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-description">
                    Description
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      value={field.value ?? ""}
                      id="form-rhf-demo-description"
                      placeholder="Enter your Job description for the role."
                      rows={6}
                      className="min-h-32 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value.length}/1000 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Provide detailed information about the job responsibilities
                    and requirements.
                  </FieldDescription>
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
            form="form-rhf-demo"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Submit"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
