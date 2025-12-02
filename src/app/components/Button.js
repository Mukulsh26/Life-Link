export default function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`
        px-4 py-2 rounded-lg 
        font-medium 
        transition-all 
        bg-red-600 hover:bg-red-700 
        active:scale-95 
        disabled:bg-red-900 disabled:cursor-not-allowed 
        shadow-md hover:shadow-red-500/20
        ${className}
      `}
    >
      {children}
    </button>
  );
}
