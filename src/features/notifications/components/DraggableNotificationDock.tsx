import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

const STORAGE_KEY = 'autowash.notificationDock.position';
const DRAG_THRESHOLD_PX = 6;

type Position = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
};

const safeMargin = () => (window.innerWidth < 640 ? 12 : 20);

const clampPosition = (position: Position, element?: HTMLElement | null): Position => {
  const margin = safeMargin();
  const width = element?.offsetWidth || 56;
  const height = element?.offsetHeight || 56;

  return {
    x: Math.min(Math.max(position.x, margin), Math.max(margin, window.innerWidth - width - margin)),
    y: Math.min(Math.max(position.y, margin), Math.max(margin, window.innerHeight - height - margin)),
  };
};

const readStoredPosition = (): Position | null => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return null;

    const parsed = JSON.parse(value) as Partial<Position>;
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') return null;

    return parsed as Position;
  } catch {
    return null;
  }
};

const storePosition = (position: Position) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  } catch {
    // Non-essential enhancement; ignore private mode/storage failures.
  }
};

export function DraggableNotificationDock({ children }: { children: ReactNode }) {
  const dockRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useLayoutEffect(() => {
    const element = dockRef.current;
    const storedPosition = readStoredPosition();
    const defaultPosition = {
      x: window.innerWidth - (element?.offsetWidth || 56) - safeMargin(),
      y: safeMargin(),
    };

    setPosition(clampPosition(storedPosition ?? defaultPosition, element));

    const handleResize = () => {
      setPosition((current) => {
        if (!current) return current;
        const next = clampPosition(current, dockRef.current);
        storePosition(next);
        return next;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0) || !position) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (!drag.moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) return;

    drag.moved = true;
    setIsDragging(true);
    event.preventDefault();

    setPosition(clampPosition({ x: drag.originX + deltaX, y: drag.originY + deltaY }, dockRef.current));
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (drag.moved) {
      suppressClickRef.current = true;
      setPosition((current) => {
        if (current) storePosition(current);
        return current;
      });
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    dragRef.current = null;
    setIsDragging(false);
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;

    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      ref={dockRef}
      className={cn(
        'pointer-events-auto fixed z-50 touch-none select-none rounded-2xl border border-white/70 bg-white/90 p-1 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-shadow duration-200',
        isDragging ? 'cursor-grabbing shadow-2xl shadow-blue-950/20' : 'cursor-grab'
      )}
      style={
        position
          ? { left: position.x, top: position.y }
          : { right: '1rem', top: '1rem' }
      }
      title="Kéo để di chuyển thông báo"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onClickCapture={handleClickCapture}
    >
      {children}
    </div>
  );
}
