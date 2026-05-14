import { motion } from "framer-motion";

export type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  title?: string;
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
}

const variantClasses: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  error: "border-rose-200 bg-rose-500/10 text-rose-700 dark:text-rose-200",
  info: "border-sky-200 bg-sky-500/10 text-sky-700 dark:text-sky-200",
};

export function Toast({ title, message, variant = "info", onClose }: ToastProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-xl shadow-black/10 ${variantClasses[variant]}`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 text-xs opacity-70 hover:opacity-100"
      >
        ×
      </button>
      {title ? <p className="text-sm font-semibold">{title}</p> : null}
      <p className="mt-1 text-sm leading-5 whitespace-pre-wrap">{message}</p>
    </motion.div>
  );
}
