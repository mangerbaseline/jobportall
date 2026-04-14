"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";

export interface CreateUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [user, setUser] = useState<CreateUser>({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Changed from true to false

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleRole = (value: string) => {
    setUser((prev) => ({
      ...prev,
      role: value,
    }));
    // Clear error when role is selected
    if (error) setError("");
  };

  useEffect(() => {
    ////console.log("---user--- :", user)
    ////console.log("----pass----- : ", confirmPass)
  }, [user, confirmPass]);

  // Validation function
  const validateForm = () => {
    if (!user.name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!user.email.trim()) {
      setError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!user.password) {
      setError("Password is required");
      return false;
    }
    if (user.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!user.role) {
      setError("Please select a role");
      return false;
    }
    if (!confirmPass) {
      setError("Please confirm your password");
      return false;
    }
    if (confirmPass !== user.password) {
      setError("Password and confirm password do not match");
      return false;
    }
    return true;
  };

  const handelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous error
    setError("");

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      ////console.log("Submitting user data:", user)

      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      ////console.log("Response status:", res.status)

      // Try to parse JSON response
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error("Invalid response from server");
      }

      if (!res.ok) {
        // Handle different error status codes
        switch (res.status) {
          case 400:
            throw new Error(data.error || "Invalid input data");
          case 409:
            throw new Error(data.error || "User already exists");
          case 500:
            throw new Error("Server error. Please try again later");
          default:
            throw new Error(data.error || "Something went wrong");
        }
      }

      // Success case
      ////console.log("Signup successful:", data)

      if (data.token) {
        ////console.log("Token saved to Cookie.")
      }

      // Show success message (optional)
      alert("Account created successfully! Redirecting to sign in...");

      // Redirect to sign in page
      router.push("/auth/signin");
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handelSubmit}>
          <FieldGroup>
            {/* Display error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                value={user.name}
                placeholder="John Doe"
                required
                onChange={handleChange}
                disabled={loading}
                className={error?.includes("name") ? "border-red-500" : ""}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={user.email}
                placeholder="m@example.com"
                required
                onChange={handleChange}
                disabled={loading}
                className={error?.includes("email") ? "border-red-500" : ""}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                value={user.password}
                required
                onChange={handleChange}
                disabled={loading}
                className={error?.includes("Password") ? "border-red-500" : ""}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPass}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPass(e.target.value)
                }
                disabled={loading}
                className={error?.includes("match") ? "border-red-500" : ""}
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <Select
                onValueChange={handleRole}
                value={user.role}
                disabled={loading}
              >
                <SelectTrigger
                  className={`w-full  ${error?.includes("role") ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <SelectItem value="USER">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>User</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="EMPLOYER">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>Employer</span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <FieldGroup>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
                <Button variant="outline" type="button" disabled={loading}>
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="/auth/signin">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
