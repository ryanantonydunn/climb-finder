import React from "react";
import { Label } from "./Label";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  containerClassName?: string;
  showLabel?: boolean;
}

export function Select({
  id,
  label,
  showLabel = true,
  containerClassName = "",
  className = "",
  children,
  ...otherProps
}: SelectProps) {
  return (
    <div className={`mb-2 ${containerClassName}`}>
      {showLabel && <Label htmlFor={id}>{label}</Label>}
      <select
        className={`w-full bg-slate-300 rounded p-1 ${className}`}
        {...otherProps}
      >
        {children}
      </select>
    </div>
  );
}
