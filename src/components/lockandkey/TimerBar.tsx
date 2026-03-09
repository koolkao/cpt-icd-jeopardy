"use client";

interface Props {
  remaining: number;
  total: number;
}

export default function TimerBar({ remaining, total }: Props) {
  const pct = Math.max(0, Math.min(100, (remaining / total) * 100));

  const getBarColor = () => {
    if (remaining > 20) return "bg-green-500";
    if (remaining > 10) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTextColor = () => {
    if (remaining > 20) return "text-green-400";
    if (remaining > 10) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50 uppercase tracking-wider">
          Time Remaining
        </span>
        <span className={`font-mono font-bold text-sm ${getTextColor()}`}>
          {remaining}s
        </span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${getBarColor()}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
