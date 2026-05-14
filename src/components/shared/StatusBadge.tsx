const statusConfig: Record<string, { label: string; className: string }> = {
  todo:        { label: "Todo",        className: "bg-slate-100 text-slate-600" },
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
  done:        { label: "Done",        className: "bg-green-100 text-green-700" },
  blocked:     { label: "Blocked",     className: "bg-red-100 text-red-700" },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low:    { label: "Low",    className: "bg-slate-100 text-slate-500" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-700" },
  high:   { label: "High",   className: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const cfg = priorityConfig[priority] ?? { label: priority, className: "bg-slate-100 text-slate-500" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
