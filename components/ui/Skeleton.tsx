export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-2">
          <div className="h-3 bg-terminal-border/50 animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonRows({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-terminal-border/30 animate-pulse ${className}`} />;
}
