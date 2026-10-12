type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

export default function Button({ children, onClick, variant = "primary" }: Props) {
  const base =
    "px-6 py-2.5 rounded-lg font-semibold transition-all duration-200";

  const styles = {
    primary:
      "bg-emerald-800 text-white hover:bg-emerald-900 active:scale-95 shadow-sm",
    secondary:
      "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 active:scale-95",
  };

  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}