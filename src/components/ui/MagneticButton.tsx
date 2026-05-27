import { Link } from "react-router-dom";
import { useMagnetic } from "../../hooks/useMagnetic";

interface MagneticButtonProps {
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
}

export function MagneticButton({
  children,
  to,
  onClick,
  variant = "primary",
  className = "",
}: MagneticButtonProps) {
  const { ref, onMouseMove, onMouseLeave } = useMagnetic(0.25);

  const base =
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer";
  const variants = {
    primary:
      "bg-[var(--color-warm)] text-[#0a0a0b] hover:shadow-[0_0_40px_rgba(232,168,124,0.35)]",
    ghost: "text-[var(--color-text)] hover:bg-white/5",
    outline:
      "border border-[var(--color-border-strong)] text-[var(--color-text)] hover:border-[var(--color-warm)]/40",
  };

  const cls = `${base} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link
        to={to}
        ref={ref as React.RefObject<HTMLAnchorElement>}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={cls}
        style={{ transition: "transform 0.15s ease-out, box-shadow 0.3s" }}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={cls}
      style={{ transition: "transform 0.15s ease-out, box-shadow 0.3s" }}
    >
      {children}
    </button>
  );
}
