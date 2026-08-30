"use client";

import { useRef, useState } from "react";
import Link from "next/link";

const ACTION_WIDTH = 76;

export function SwipeableRow({
  children,
  editHref,
  deleteAction,
  deleteId,
}: {
  children: React.ReactNode;
  editHref: string;
  deleteAction: (formData: FormData) => void;
  deleteId: string;
}) {
  const [translateX, setTranslateX] = useState(0);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startRef = useRef({ x: 0, translate: 0 });
  const [animate, setAnimate] = useState(false);

  function onPointerDown(e: React.PointerEvent) {
    startRef.current = { x: e.clientX, translate: translateX };
    draggingRef.current = true;
    movedRef.current = false;
    setAnimate(false);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const delta = e.clientX - startRef.current.x;
    if (Math.abs(delta) > 4) movedRef.current = true;
    const next = Math.min(
      ACTION_WIDTH,
      Math.max(-ACTION_WIDTH, startRef.current.translate + delta),
    );
    setTranslateX(next);
  }

  function endDrag() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setAnimate(true);
    setTranslateX((current) => {
      if (current <= -ACTION_WIDTH / 2) return -ACTION_WIDTH;
      if (current >= ACTION_WIDTH / 2) return ACTION_WIDTH;
      return 0;
    });
  }

  function handleClick(e: React.MouseEvent) {
    if (movedRef.current || translateX !== 0) {
      e.preventDefault();
      setAnimate(true);
      setTranslateX(0);
    }
  }

  return (
    <div className="relative overflow-hidden bg-negative">
      <div
        className="absolute inset-y-0 left-0 flex items-center justify-center bg-brand text-xs font-medium text-brand-ink"
        style={{ width: ACTION_WIDTH }}
      >
        Editar
      </div>
      <form
        action={deleteAction}
        className="absolute inset-y-0 right-0"
        style={{ width: ACTION_WIDTH }}
      >
        <input type="hidden" name="id" value={deleteId} />
        <button
          type="submit"
          className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-xs font-medium text-white"
        >
          <span aria-hidden="true">🗑️</span>
          Eliminar
        </button>
      </form>

      <Link
        href={editHref}
        onClick={handleClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative flex touch-pan-y items-center bg-surface"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: animate ? "transform 200ms ease-out" : "none",
        }}
      >
        {children}
      </Link>
    </div>
  );
}
