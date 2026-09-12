import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import "./Button.css";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      style,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const classes = ["btn", variantClass, sizeClass, className].filter(Boolean).join(" ");

    return (
      <button
        ref={ref}
        aria-disabled={isDisabled}
        className={classes}
        onClick={(e) => {
          if (isDisabled) {
            e.preventDefault();
            return;
          }
          onClick?.(e);
        }}
        style={style}
        {...props}
      >
        {loading && <Loader2 size={16} className="btn-spinner" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
