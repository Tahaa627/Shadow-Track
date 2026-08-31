"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Building2,
  User,
} from "lucide-react";

import { registerUser } from "../api/register";
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

export default function RegisterForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormData>({
    defaultValues: {
      organization_name: "",
      organization_slug: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (
    data: RegisterFormData,
  ) => {
    setServerError("");
    clearErrors();

    try {
      await registerUser(data);

      /*
       * Registration succeeded.
       *
       * We redirect to login and tell the login
       * page that registration was successful.
       */
      router.push("/login?registered=true");
    } catch (error) {
      console.error(
        "Registration error:",
        error,
      );

      if (error instanceof ApiError) {
        const apiData = error.data;

        /*
         * Django/DRF usually returns:
         *
         * {
         *   "email": ["A user with this email already exists."]
         * }
         */

        if (
          typeof apiData === "object" &&
          apiData !== null
        ) {
          const data =
            apiData as Record<
              string,
              unknown
            >;

          let handledFieldError = false;

          for (const field of [
            "organization_name",
            "organization_slug",
            "email",
            "password",
            "first_name",
            "last_name",
          ]) {
            const value = data[field];

            if (Array.isArray(value)) {
              const message =
                value.find(
                  (item) =>
                    typeof item === "string",
                );

              if (typeof message === "string") {
                setError(
                  field as keyof RegisterFormData,
                  {
                    type: "server",
                    message,
                  },
                );

                handledFieldError = true;
              }
            }
          }

          /*
           * Handle non-field/detail errors.
           */
          if (
            typeof data.detail === "string"
          ) {
            setServerError(data.detail);
            return;
          }

          /*
           * If Django returned field errors,
           * don't show a generic error as well.
           */
          if (handledFieldError) {
            return;
          }
        }

        setServerError(
          "Unable to create your account. Please try again.",
        );

        return;
      }

      setServerError(
        "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      {/* Server error */}

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
          type="text"
          autoComplete="organization"
          placeholder="Acme Corporation"
          aria-invalid={
            !!errors.organization_name
          }
          className={inputClass(
            !!errors.organization_name,
          )}
          {...register(
            "organization_name",
            {
              required:
                "Organization name is required.",
              maxLength: {
                value: 255,
                message:
                  "Organization name cannot exceed 255 characters.",
              },
            },
          )}
        />

        <FieldError
          message={
            errors.organization_name?.message
          }
        />
      </div>

      {/* Organization slug */}

      <div>
        <FieldLabel
          htmlFor="organization_slug"
          label="Organization slug"
          icon={<Building2 size={14} />}
        />

        <div
          className={`flex rounded-md border bg-[var(--color-surface)] focus-within:border-[var(--color-primary)] ${
            errors.organization_slug
              ? "border-[var(--color-danger)]"
              : "border-[var(--color-border)]"
          }`}
        >
          <span className="flex items-center border-r border-[var(--color-border)] px-3 font-mono text-xs text-[var(--color-text-muted)]">
            shadowaudit/
          </span>

          <input
            id="organization_slug"
            type="text"
            autoComplete="off"
            placeholder="acme"
            aria-invalid={
              !!errors.organization_slug
            }
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
            {...register(
              "organization_slug",
              {
                required:
                  "Organization slug is required.",
                maxLength: {
                  value: 255,
                  message:
                    "Organization slug cannot exceed 255 characters.",
                },
                pattern: {
                  value:
                    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message:
                    "Use lowercase letters, numbers, and hyphens only.",
                },
              },
            )}
          />
        </div>

        <FieldError
          message={
            errors.organization_slug?.message
          }
        />
      </div>

      {/* Name */}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel
            htmlFor="first_name"
            label="First name"
            icon={<User size={14} />}
          />

          <input
            id="first_name"
            type="text"
            autoComplete="given-name"
            placeholder="John"
            className={inputClass(false)}
            {...register("first_name", {
              maxLength: {
                value: 100,
                message:
                  "First name cannot exceed 100 characters.",
              },
            })}
          />

          <FieldError
            message={
              errors.first_name?.message
            }
          />
        </div>

        <div>
          <FieldLabel
            htmlFor="last_name"
            label="Last name"
          />

          <input
            id="last_name"
            type="text"
            autoComplete="family-name"
            placeholder="Doe"
            className={inputClass(false)}
            {...register("last_name", {
              maxLength: {
                value: 100,
                message:
                  "Last name cannot exceed 100 characters.",
              },
            })}
          />

          <FieldError
            message={
              errors.last_name?.message
            }
          />
        </div>
      </div>

      {/* Email */}

      <div>
        <FieldLabel
          htmlFor="email"
          label="Work email"
          icon={<Mail size={14} />}
        />

        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="john@company.com"
          aria-invalid={!!errors.email}
          className={inputClass(
            !!errors.email,
          )}
          {...register("email", {
            required: "Email is required.",
            pattern: {
              value:
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message:
                "Please enter a valid email address.",
            },
          })}
        />

        <FieldError
          message={errors.email?.message}
        />
      </div>

      {/* Password */}

      <div>
        <FieldLabel
          htmlFor="password"
          label="Password"
          icon={<LockKeyhole size={14} />}
        />

        <div
          className={`flex rounded-md border bg-[var(--color-surface)] transition-colors focus-within:border-[var(--color-primary)] ${
            errors.password
              ? "border-[var(--color-danger)]"
              : "border-[var(--color-border)]"
          }`}
        >
          <input
            id="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            aria-invalid={
              !!errors.password
            }
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
            {...register("password", {
              required:
                "Password is required.",
              minLength: {
                value: 8,
                message:
                  "Password must contain at least 8 characters.",
              },
            })}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) => !current,
              )
            }
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            className="px-3 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
          >
            {showPassword ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button>
        </div>

        <FieldError
          message={errors.password?.message}
        />
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
          Create Organization
        </Button>
      </div>

      {/* Login */}

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[var(--color-primary)] hover:underline"
        >
          Sign in
        </Link>
      </p>

      {/* Security notice */}

      <p className="text-center text-[10px] leading-5 text-[var(--color-text-muted)]">
        By continuing, you agree to the
        ShadowAudit terms and privacy policy.
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
        <span
          className="text-[var(--color-text-muted)]"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      {label}
    </label>
  );
}

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="mt-1.5 text-[10px] text-[var(--color-danger)]"
    >
      {message}
    </p>
  );
}

function inputClass(
  hasError: boolean,
) {
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
    ${
      hasError
        ? "border-[var(--color-danger)]"
        : "border-[var(--color-border)]"
    }
  `.trim();
}