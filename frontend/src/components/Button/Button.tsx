import type { ButtonProps } from "./Button.types";

const variantStyles = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-neutral)] hover:bg-[var(--color-primary-hover)] border border-[var(--color-primary)]",

  secondary:
    "bg-[var(--color-secondary)] text-[var(--color-neutral)] hover:opacity-90 border border-[var(--color-secondary)]",

  tertiary:
    "bg-[var(--color-tertiary)] text-[var(--color-neutral)] hover:opacity-90 border border-[var(--color-tertiary)]",

  outlined:
    "bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border-strong)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",

  ghost:
    "bg-transparent text-[var(--color-text-muted)] border border-transparent hover:text-[var(--color-primary)]",

  danger:
    "bg-[var(--color-danger)] text-[var(--color-neutral)] hover:opacity-90 border border-[var(--color-danger)]",
};

const sizeStyles = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-10 px-5 text-sm",
  lg: "min-h-12 px-7 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={[
        "inline-flex items-center justify-center",
        "rounded-md",
        "font-medium",
        "tracking-wide",
        "transition-all duration-200",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-[#D4AF37]/60",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-[#0A0D14]",
        "disabled:pointer-events-none",
        "disabled:opacity-50",
        "active:scale-[0.98]",
        sizeStyles[size],
        variantStyles[variant],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}