import { useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

type Align = "start" | "end" | "center";

type UseAnchoredPopoverPositionOptions = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  /** `start` = align panel left with anchor; `end` = align panel right with anchor */
  align?: Align;
  gap?: number;
  margin?: number;
};

export function useAnchoredPopoverPosition({
  open,
  anchorRef,
  panelRef,
  align = "start",
  gap = 8,
  margin = 12,
}: UseAnchoredPopoverPositionOptions): CSSProperties | undefined {
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!open) {
      setStyle({});
      return;
    }

    const update = () => {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;

      const anchorRect = anchor.getBoundingClientRect();
      const panelWidth = panel.offsetWidth;
      const panelHeight = panel.offsetHeight;

      let left =
        align === "end"
          ? anchorRect.right - panelWidth
          : align === "center"
            ? anchorRect.left + anchorRect.width / 2 - panelWidth / 2
            : anchorRect.left;
      let top = anchorRect.bottom + gap;

      if (left + panelWidth > window.innerWidth - margin) {
        left = window.innerWidth - panelWidth - margin;
      }
      if (left < margin) {
        left = margin;
      }

      if (top + panelHeight > window.innerHeight - margin) {
        const above = anchorRect.top - panelHeight - gap;
        top = above >= margin ? above : Math.max(margin, window.innerHeight - panelHeight - margin);
      }

      setStyle({
        position: "fixed",
        top,
        left,
        width: panelWidth,
        zIndex: 50,
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef, panelRef, align, gap, margin]);

  return open ? style : undefined;
}
