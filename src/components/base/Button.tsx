import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "utility" | "large";
}

export function Button({
  className,
  children,
  variant = "large",
  ...otherProps
}: ButtonProps) {
  const mainClass =
    variant === "utility"
      ? "bg-blue-500 text-white rounded py-1 px-2"
      : "w-full bg-blue-500 text-white text-sm rounded py-1 px-2";
  return (
    <button
      type="button"
      className={`${mainClass} ${className}`}
      {...otherProps}
    >
      {children}
    </button>
  );
}
