import { SearchX } from "lucide-react";

interface Props {
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, message, action }: Props) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-navy-900/15 bg-ice-50/60 px-6 py-16 text-center" role="status">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-ice-500 shadow-card">
        <SearchX className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-navy-900/60">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
