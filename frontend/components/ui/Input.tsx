import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-sm font-bold text-[var(--color-text-main)]">{label}</label>}
        <input
          ref={ref}
          className={`bg-[var(--color-primary-bg)] border-[3px] border-[var(--color-tertiary-bg)] text-[var(--color-text-main)] rounded-[20px] px-4 py-2 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors ${
            error ? "border-[var(--color-accent-magenta)]" : ""
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-[var(--color-accent-magenta)] font-bold">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
