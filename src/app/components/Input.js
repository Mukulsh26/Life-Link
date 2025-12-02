export default function Input({ label, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      {label && <label className="text-slate-300 font-medium">{label}</label>}

      <input
        {...props}
        className={`
          px-3 py-2 rounded-lg 
          bg-slate-900 
          border border-slate-700 
          focus:ring-2 focus:ring-red-500 
          outline-none 
          placeholder:text-slate-500 
          transition-all
          ${className}
        `}
      />
    </div>
  );
}
