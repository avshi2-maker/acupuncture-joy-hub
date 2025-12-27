import { useEffect } from "react";

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.addEventListener("touchmove", preventTouchMove, { passive: false });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, [locked]);
}
