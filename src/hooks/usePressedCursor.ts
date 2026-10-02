import { useEffect } from "react";

// Shows the pressed cursor while the left mouse button is held, including
// while dragging out a text selection. See docs/design/2026-10-02-custom-cursor.md.
export default function usePressedCursor() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    const root = document.documentElement;
    const press = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button === 0) {
        root.classList.add("pressing");
      }
    };
    const release = () => root.classList.remove("pressing");

    document.addEventListener("pointerdown", press);
    document.addEventListener("pointerup", release);
    document.addEventListener("pointercancel", release);
    // The page may never get pointerup if the button is released outside the window.
    window.addEventListener("blur", release);
    return () => {
      document.removeEventListener("pointerdown", press);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", release);
    };
  }, []);
}
