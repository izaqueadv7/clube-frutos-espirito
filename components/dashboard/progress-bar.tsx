export function ProgressBar({ label, value }: { label: string; value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>
      <div className="h-2 rounded-full bg-red-100">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
