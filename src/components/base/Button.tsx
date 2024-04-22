import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "utility" | "large" | "round";
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
      : variant === "round"
      ? "bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
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
