import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseClass = "font-bold rounded-[20px] transition-all border-[3px] flex items-center justify-center gap-2";
    
    const variantClasses = {
      primary: "bg-[var(--color-accent-blue)] text-white border-transparent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
      secondary: "bg-transparent text-[var(--color-accent-blue)] border-[var(--color-accent-blue)] hover:bg-[var(--color-secondary-bg)] disabled:opacity-50 disabled:cursor-not-allowed",
      danger: "bg-transparent text-[var(--color-accent-magenta)] border-[var(--color-accent-magenta)] hover:bg-[var(--color-secondary-bg)] disabled:opacity-50 disabled:cursor-not-allowed",
    };

    const sizeClasses = {
      sm: "px-4 py-1 text-sm",
      md: "px-6 py-2 text-base",
      lg: "px-8 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
