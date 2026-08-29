"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import Button from "@/components/Button";
import { loginUser } from "../api/login";

interface LoginFormData {
  email: string;
  password: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (
    field: keyof LoginFormData,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setServerError("");
  };

  const validate = (): FieldErrors => {
    const newErrors: FieldErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    return newErrors;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setServerError("");

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await loginUser(formData);

      /*
       * Authentication state will be handled by the secure
       * session layer.
       *
       * We intentionally do not store credentials or tokens
       * in localStorage/sessionStorage here.
       */

      window.location.href = "/dashboard";
    } catch {
      setServerError(
        "Invalid email or password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
    >
      {serverError && (
        <div
          role="alert"
          className="rounded-md border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/5 px-4 py-3 text-xs text-[var(--color-danger)]"
        >
          {serverError}
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
        >
          <Mail
            size={14}
            className="text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          Work email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(event) =>
            updateField("email", event.target.value)
          }
          placeholder="john@company.com"
          className={inputClass(!!errors.email)}
        />

        {errors.email && (
          <p className="mt-1.5 text-[10px] text-[var(--color-danger)]">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="password"
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
          >
            <LockKeyhole
              size={14}
              className="text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
            Password
          </label>

          <Link
            href="/forgot-password"
            className="text-[10px] text-[var(--color-primary)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <div
          className={`flex rounded-md border bg-[var(--color-surface)] focus-within:border-[var(--color-primary)] ${
            errors.password
              ? "border-[var(--color-danger)]"
              : "border-[var(--color-border)]"
          }`}
        >
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={formData.password}
            onChange={(event) =>
              updateField(
                "password",
                event.target.value,
              )
            }
            placeholder="Enter your password"
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((current) => !current)
            }
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            className="px-3 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          >
            {showPassword ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="mt-1.5 text-[10px] text-[var(--color-danger)]">
            {errors.password}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
        >
          Sign In
        </Button>
      </div>

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-[var(--color-primary)] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

function inputClass(hasError: boolean) {
  return `
    w-full
    rounded-md
    border
    bg-[var(--color-surface)]
    px-3
    py-2.5
    text-sm
    text-[var(--color-text-primary)]
    outline-none
    placeholder:text-[var(--color-text-muted)]
    focus:border-[var(--color-primary)]
    ${
      hasError
        ? "border-[var(--color-danger)]"
        : "border-[var(--color-border)]"
    }
  `;
}