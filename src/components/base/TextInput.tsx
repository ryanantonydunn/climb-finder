import React from "react";
import { Label } from "./Label";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  type?: string;
  iconLeft?: React.ReactElement;
  containerClassName?: string;
  showLabel?: boolean;
}

export function TextInput({
  id,
  label,
  showLabel = true,
  type = "text",
  containerClassName = "",
  className = "",
  iconLeft,
  ...otherProps
}: TextInputProps) {
  return (
    <div className={`mb-2 ${containerClassName}`}>
      {showLabel && <Label htmlFor={id}>{label}</Label>}
      <div className="flex items-center bg-slate-300 rounded">
        {iconLeft && <span className="inline-block mx-1">{iconLeft}</span>}
        <input
          className={`w-full flex-grow p-1 bg-transparent ${className}`}
          {...otherProps}
          type={type}
          aria-label={showLabel ? label : undefined}
        />
      </div>
    </div>
  );
}
