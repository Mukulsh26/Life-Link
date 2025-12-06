import React from "react";

const Input = React.forwardRef(({ label, ...props }, ref) => {
  return (
    <div className="flex flex-col text-sm">
      <label className="text-slate-300 mb-1">{label}</label>
      <input
        ref={ref}
        {...props}
        className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
      />
    </div>
  );
});

Input.displayName = "Input";
export default Input;
