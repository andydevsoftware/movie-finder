"use client";

import { useEffect, useCallback, useRef } from "react";

interface UseKeyboardNavigationProps {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onEnter,
  onEscape,
  enabled = true,
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          onArrowUp?.();
          break;
        case "ArrowDown":
          e.preventDefault();
          onArrowDown?.();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onArrowLeft?.();
          break;
        case "ArrowRight":
          e.preventDefault();
          onArrowRight?.();
          break;
        case "Enter":
          e.preventDefault();
          onEnter?.();
          break;
        case "Escape":
          e.preventDefault();
          onEscape?.();
          break;
      }
    },
    [
      enabled,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onEnter,
      onEscape,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Hook for managing focus within a grid
export function useGridNavigation(
  rows: number,
  cols: number,
  onSelect: (index: number) => void
) {
  const currentIndexRef = useRef(0);
  const maxIndex = rows * cols - 1;

  const moveUp = useCallback(() => {
    const newIndex = Math.max(0, currentIndexRef.current - cols);
    currentIndexRef.current = newIndex;
    focusElement(newIndex);
  }, [cols]);

  const moveDown = useCallback(() => {
    const newIndex = Math.min(maxIndex, currentIndexRef.current + cols);
    currentIndexRef.current = newIndex;
    focusElement(newIndex);
  }, [cols, maxIndex]);

  const moveLeft = useCallback(() => {
    if (currentIndexRef.current % cols !== 0) {
      currentIndexRef.current--;
      focusElement(currentIndexRef.current);
    }
  }, [cols]);

  const moveRight = useCallback(() => {
    if (
      currentIndexRef.current % cols !== cols - 1 &&
      currentIndexRef.current < maxIndex
    ) {
      currentIndexRef.current++;
      focusElement(currentIndexRef.current);
    }
  }, [cols, maxIndex]);

  const select = useCallback(() => {
    onSelect(currentIndexRef.current);
  }, [onSelect]);

  const focusElement = (index: number) => {
    const element = document.querySelector(
      `[data-grid-index="${index}"]`
    ) as HTMLElement;
    element?.focus();
  };

  useKeyboardNavigation({
    onArrowUp: moveUp,
    onArrowDown: moveDown,
    onArrowLeft: moveLeft,
    onArrowRight: moveRight,
    onEnter: select,
  });

  return { currentIndex: currentIndexRef.current };
}
