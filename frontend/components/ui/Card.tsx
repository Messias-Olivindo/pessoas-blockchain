import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "educational";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const bgClass = variant === "educational" ? "bg-[var(--color-educational)]" : "bg-[var(--color-secondary-bg)]";
    
    return (
      <div
        ref={ref}
        className={`${bgClass} p-6 rounded-[20px] border-[3px] border-[var(--color-tertiary-bg)] ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
