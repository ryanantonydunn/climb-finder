import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, children, ...otherProps }: LabelProps) {
  const labelClassName = `block text-xs font-bold w-full mb-1 ${className}`;
  return (
    <label className={labelClassName} {...otherProps}>
      {children}
    </label>
  );
}
