"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
  overscan?: number;
  gap?: number;
  className?: string;
  listClassName?: string;
  animation?: "scale" | "slide" | "fade" | "none";
  emptyContent?: React.ReactNode;
}

const animationVariants = {
  scale: {
    initial: { opacity: 0, y: -10, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slide: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
} as const;

type AnimationType = keyof typeof animationVariants;

export function VirtualizedList<T extends { id: string | number }>({
  items,
  renderItem,
  estimateSize = 80,
  overscan = 8,
  gap = 8,
  className,
  listClassName,
  animation = "scale",
  emptyContent,
}: VirtualizedListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    gap,
  });

  if (items.length === 0 && emptyContent) {
    return <>{emptyContent}</>;
  }

  const virtualItems = virtualizer.getVirtualItems();
  const useMotion = animation !== "none";
  const variants = useMotion ? animationVariants[animation as AnimationType] : null;

  return (
    <div
      ref={parentRef}
      className={cn("overflow-auto", className)}
      style={{ contain: "strict" }}
    >
      <div
        className={cn("relative w-full", listClassName)}
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        <div
          className="absolute left-0 top-0 w-full"
          style={{
            transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
          }}
        >
          {useMotion ? (
            <AnimatePresence mode="popLayout" initial={false}>
              {virtualItems.map((virtualRow) => {
                const item = items[virtualRow.index];
                return (
                  <motion.div
                    key={item.id}
                    data-index={virtualRow.index}
                    ref={(node) => virtualizer.measureElement(node)}
                    layout
                    initial={variants!.initial}
                    animate={variants!.animate}
                    exit={variants!.exit}
                    transition={{
                      type: "spring",
                      duration: 0.4,
                      bounce: 0.15,
                      layout: { type: "spring", duration: 0.4, bounce: 0.15 },
                    }}
                  >
                    {renderItem(item, virtualRow.index)}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            virtualItems.map((virtualRow) => {
              const item = items[virtualRow.index];
              return (
                <div
                  key={item.id}
                  data-index={virtualRow.index}
                  ref={(node) => virtualizer.measureElement(node)}
                >
                  {renderItem(item, virtualRow.index)}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
