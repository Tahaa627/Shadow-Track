"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import Button from "@/components/Button";
import { loginUser } from "../api/login";
import { ApiError } from "@/services/api";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const registered =
    searchParams?.get("registered") === "true";

  const [showPassword, setShowPassword] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (
    data: LoginFormData,
  ) => {
    setServerError("");
    clearErrors();

    try {
      await loginUser(data);

      /*
       * loginUser is responsible for the
       * authentication/session handling.
       *
       * The form only handles the UI flow.
       */

      router.replace("/dashboard");
    } catch (error) {
      console.error(
        "Login error:",
        error,
      );

      if (error instanceof ApiError) {
        const apiData = error.data;

        /*
         * Handle Django/DRF field errors.
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

          const emailError = getErrorMessage(
            data.email,
          );

          const passwordError =
            getErrorMessage(data.password);

          if (emailError) {
            setError("email", {
              type: "server",
              message: emailError,
            });
          }

          if (passwordError) {
            setError("password", {
              type: "server",
              message: passwordError,
            });
          }

          /*
           * Authentication errors such as:
           *
           * {
           *   "detail":
           *   "No active account found..."
           * }
           *
           * are shown as a generic authentication
           * message to avoid revealing whether
           * an email account exists.
           */
          if (
            typeof data.detail === "string"
          ) {
            setServerError(
              "Invalid email or password. Please try again.",
            );

            return;
          }

          if (
            emailError ||
            passwordError
          ) {
            return;
          }
        }
      }

      setServerError(
        "Unable to sign in. Please try again.",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      {/* Registration success */}

      {registered && (
        <div
          role="status"
          className="rounded-md border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/5 px-4 py-3 text-xs text-[var(--color-primary)]"
        >
          <p className="font-medium">
            Account created successfully.
          </p>

          <p className="mt-1 opacity-80">
            Your account is ready. Please sign
            in to continue.
          </p>
        </div>
      )}

      {/* Server error */}

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
          type="email"
          autoComplete="email"
          placeholder="john@company.com"
          aria-invalid={!!errors.email}
          className={inputClass(
            !!errors.email,
          )}
          {...register("email", {
            required:
              "Email is required.",
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
            type={
              showPassword
                ? "text"
                : "password"
            }
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={
              !!errors.password
            }
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
            {...register("password", {
              required:
                "Password is required.",
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
          Sign In
        </Button>
      </div>

      {/* Register */}

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
    placeholder:text-[var(--color-text-muted)]
    focus:border-[var(--color-primary)]
    ${
      hasError
        ? "border-[var(--color-danger)]"
        : "border-[var(--color-border)]"
    }
  `.trim();
}

function getErrorMessage(
  value: unknown,
): string | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const message = value.find(
    (item) => typeof item === "string",
  );

  return typeof message === "string"
    ? message
    : undefined;
}