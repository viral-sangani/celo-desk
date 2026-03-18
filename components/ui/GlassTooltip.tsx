"use client";

import { useState, useRef, useCallback } from "react";

interface GlassTooltipProps {
  text: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export default function GlassTooltip({
  text,
  children,
  maxWidth = 320,
}: GlassTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (e: React.MouseEvent) => {
      if (!text) return;
      timeout.current = setTimeout(() => {
        setPos({ x: e.clientX, y: e.clientY });
        setVisible(true);
      }, 300);
    },
    [text]
  );

  const hide = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    setVisible(false);
  }, []);

  const move = useCallback(
    (e: React.MouseEvent) => {
      if (visible) {
        setPos({ x: e.clientX, y: e.clientY });
      }
    },
    [visible]
  );

  return (
    <>
      <div
        onMouseEnter={show}
        onMouseLeave={hide}
        onMouseMove={move}
        className="contents"
      >
        {children}
      </div>
      {visible && text && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: pos.x + 12,
            top: pos.y + 12,
            maxWidth,
          }}
        >
          <div className="px-3 py-2 rounded text-xs text-gray-100 leading-relaxed backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {text}
          </div>
        </div>
      )}
    </>
  );
}
