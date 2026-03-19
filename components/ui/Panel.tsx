"use client";

import { ReactNode, useState } from "react";

interface PanelProps {
  title?: string;
  titleColor?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export default function Panel({
  title,
  titleColor = "text-terminal-amber",
  headerRight,
  children,
  className = "",
  collapsible = false,
  defaultCollapsed = false,
}: PanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section
      className={`border-panel flex flex-col ${
        collapsible && collapsed ? "shrink-0" : "flex-1 overflow-hidden min-h-0"
      } ${className}`}
    >
      {title && (
        <div
          className={`panel-header flex justify-between items-center ${
            collapsible ? "cursor-pointer select-none" : ""
          }`}
          onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        >
          <span className={`${titleColor} font-bold`}>
            {collapsible && (
              <span className={`text-gray-500 mr-2 text-[10px] inline-block transition-transform duration-150 ${collapsed ? "" : "rotate-90"}`}>
                ▶
              </span>
            )}
            {title}
          </span>
          {headerRight}
        </div>
      )}
      {!(collapsible && collapsed) && (
        <div className="flex-grow min-h-0 flex flex-col">{children}</div>
      )}
    </section>
  );
}
