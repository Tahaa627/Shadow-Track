"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser } from "../api/register";
import { Eye, EyeOff, LockKeyhole, Mail, Building2, User } from "lucide-react";

import Button from "@/components/Button";
import { ApiError } from "@/services/api";

interface RegisterFormData {
  organization_name: string;
  organization_slug: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface FieldErrors {
  [key: string]: string | undefined;
}

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    organization_name: "",
    organization_slug: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field: keyof RegisterFormData, value: string) => {
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

  const validate = () => {
    const newErrors: FieldErrors = {};

    if (!formData.organization_name.trim()) {
      newErrors.organization_name = "Organization name is required.";
    }

    if (!formData.organization_slug.trim()) {
      newErrors.organization_slug = "Organization slug is required.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.organization_slug)) {
      newErrors.organization_slug = "Use lowercase letters, numbers, and hyphens only.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters.";
    }

    return newErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser(formData);
      // Registration succeeded.
      // We will decide the post-registration flow
      // when authentication is implemented.
    } catch (error) {
      // Django validation handling will be refined next.
      setServerError(
        "Unable to create your account. Please check your information and try again."
      );
      console.error("Registration error:", error);

      if (error instanceof ApiError) {
        console.error("Status:", error.status);
        console.error("Data:", error.data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && (
        <div
          role="alert"
          className="rounded-md border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/5 px-4 py-3 text-xs text-[var(--color-danger)]"
        >
          {serverError}
        </div>
      )}

      {/* Organization */}
      <div>
        <FieldLabel
          htmlFor="organization_name"
          label="Organization name"
          icon={<Building2 size={14} />}
        />

        <input
          id="organization_name"
          name="organization_name"
          type="text"
          autoComplete="organization"
          value={formData.organization_name}
          onChange={(event) => updateField("organization_name", event.target.value)}
          placeholder="Acme Corporation"
          className={inputClass(!!errors.organization_name)}
        />

        <FieldError message={errors.organization_name} />
      </div>

      {/* Organization slug */}
      <div>
        <FieldLabel
          htmlFor="organization_slug"
          label="Organization slug"
          icon={<Building2 size={14} />}
        />

        <div className="flex rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] focus-within:border-[var(--color-primary)]">
          <span className="flex items-center border-r border-[var(--color-border)] px-3 font-mono text-xs text-[var(--color-text-muted)]">
            shadowaudit/
          </span>

          <input
            id="organization_slug"
            name="organization_slug"
            type="text"
            autoComplete="off"
            value={formData.organization_slug}
            onChange={(event) =>
              updateField("organization_slug", event.target.value.toLowerCase())
            }
            placeholder="acme"
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
        </div>

        <FieldError message={errors.organization_slug} />
      </div>

      {/* Name */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="first_name" label="First name" icon={<User size={14} />} />

          <input
            id="first_name"
            name="first_name"
            type="text"
            autoComplete="given-name"
            value={formData.first_name}
            onChange={(event) => updateField("first_name", event.target.value)}
            placeholder="John"
            className={inputClass(false)}
          />
        </div>

        <div>
          <FieldLabel htmlFor="last_name" label="Last name" />

          <input
            id="last_name"
            name="last_name"
            type="text"
            autoComplete="family-name"
            value={formData.last_name}
            onChange={(event) => updateField("last_name", event.target.value)}
            placeholder="Doe"
            className={inputClass(false)}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <FieldLabel htmlFor="email" label="Work email" icon={<Mail size={14} />} />

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="john@company.com"
          className={inputClass(!!errors.email)}
        />

        <FieldError message={errors.email} />
      </div>

      {/* Password */}
      <div>
        <FieldLabel htmlFor="password" label="Password" icon={<LockKeyhole size={14} />} />

        <div
          className={`flex rounded-md border bg-[var(--color-surface)] transition-colors focus-within:border-[var(--color-primary)] ${
            errors.password ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
          }`}
        >
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={formData.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="Minimum 8 characters"
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="px-3 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <FieldError message={errors.password} />
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
          Create Organization
        </Button>
      </div>

      {/* Login */}
      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--color-primary)] hover:underline">
          Sign in
        </Link>
      </p>

      {/* Security notice */}
      <p className="text-center text-[10px] leading-5 text-[var(--color-text-muted)]">
        By continuing, you agree to the ShadowAudit terms and privacy policy.
      </p>
    </form>
  );
}

function FieldLabel({
  htmlFor,
  label,
  icon,
}: {
  htmlFor: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
    >
      {icon && (
        <span className="text-[var(--color-text-muted)]" aria-hidden="true">
          {icon}
        </span>
      )}
      {label}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-[10px] text-[var(--color-danger)]">{message}</p>;
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
    transition-colors
    placeholder:text-[var(--color-text-muted)]
    focus:border-[var(--color-primary)]
    ${hasError ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"}
  `.trim();
}
