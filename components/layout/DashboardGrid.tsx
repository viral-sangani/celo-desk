import { ReactNode } from "react";

interface DashboardGridProps {
  topLeft: ReactNode;
  topRight: ReactNode;
  bottomLeft: ReactNode;
  bottomRight: ReactNode;
}

export default function DashboardGrid({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}: DashboardGridProps) {
  return (
    <main className="grid grid-cols-1 lg:grid-cols-[60%_40%] lg:grid-rows-2 p-1 gap-1 overflow-auto lg:overflow-hidden lg:h-[calc(100vh-2.5rem-1.5rem)]">
      <div className="min-h-[300px] lg:min-h-0 flex flex-col">{topLeft}</div>
      <div className="overflow-hidden flex flex-col min-h-[250px] lg:min-h-0">
        {topRight}
      </div>
      <div className="min-h-[200px] lg:min-h-0 flex flex-col">{bottomLeft}</div>
      <div className="min-h-[200px] lg:min-h-0 flex flex-col">{bottomRight}</div>
    </main>
  );
}
