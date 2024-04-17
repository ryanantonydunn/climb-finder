import React, { MouseEventHandler } from "react";

interface TagProps extends React.PropsWithChildren {
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  checked?: boolean;
}

export function Tag({ className = "", onClick, checked, children }: TagProps) {
  const wrapperClass = `inline-block bg-slate-200 rounded p-1 pr-2 ${className}`;
  const inner = (
    <>
      {checked === true && (
        <span className="inline-block mr-1 w-4 h-4 text-xs font-bold rounded-full bg-green-500 text-white">
          &#x2713;
        </span>
      )}
      {checked === false && (
        <span className="inline-block mr-1 w-4 h-4 text-xs font-bold rounded-full bg-slate-400">
          &nbsp;
        </span>
      )}
      {children}
    </>
  );
  if (onClick) {
    return (
      <button className={wrapperClass} onClick={onClick}>
        {inner}
      </button>
    );
  }
  return <span className={wrapperClass}>{inner}</span>;
}
