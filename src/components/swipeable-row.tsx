"use client";

import { useRef, useState } from "react";
import Link from "next/link";

const ACTION_WIDTH = 56;

function PencilIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.5 7.5 16.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 7v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

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
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-1 left-0" style={{ width: ACTION_WIDTH }}>
        <div
          className="flex h-full items-center justify-center rounded-xl bg-brand text-brand-ink mx-1.5"
          aria-label="Editar"
        >
          <PencilIcon />
        </div>
      </div>
      <form
        action={deleteAction}
        className="absolute inset-y-1 right-0"
        style={{ width: ACTION_WIDTH }}
      >
        <input type="hidden" name="id" value={deleteId} />
        <button
          type="submit"
          aria-label="Eliminar"
          className="flex h-full w-[calc(100%-12px)] mx-1.5 items-center justify-center rounded-xl bg-negative text-white"
        >
          <TrashIcon />
        </button>
      </form>

      <Link
        href={editHref}
        onClick={handleClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative flex touch-pan-y items-center bg-page"
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
