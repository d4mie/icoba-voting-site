type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
};

const variantClasses = {
  primary: "bg-[var(--icoba-green)] text-white hover:bg-[var(--icoba-green-dark)]",
  secondary:
    "border-2 border-[var(--icoba-blue)] bg-white text-[var(--icoba-blue)] hover:bg-[var(--icoba-blue-soft)]",
  danger: "bg-red-700 text-white hover:bg-red-800",
};

export function Button({
  variant = "primary",
  loading,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
