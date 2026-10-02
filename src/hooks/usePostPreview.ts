import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { FocusEvent, MouseEvent } from "react";

// Cursor-anchored, viewport-aware placement for the /posts hover panel. CSS
// can't measure available space, so the reveal lives here instead - see
// plans/POSTS_LIST_HOVER_PANEL_JS_PLAN.md for the full rationale and the
// convention break it represents (no other JS-driven layout in the codebase).

const OFFSET = 16; // gap between cursor and panel
const MARGIN = 12; // min gap from any viewport edge
const SHADOW = 10; // box-shadow: 10px 10px extends past the panel's border box

const SHOW_DELAY = 100; // ms of dwell before the panel appears
const HIDE_GRACE = 200; // ms after leaving before it goes away

// Panel follows the pointer continuously. Flip to false to place it once on row
// entry instead - a one-line change, kept as a constant because a 360px card
// with a hard offset shadow sliding continuously may read as restless once
// it's real. See the plan's "Residual risk is feel, not frames".
const TRACK_CURSOR = true;

// Separate from CAPABILITY_QUERY on purpose: reduced motion should stop the
// panel following the cursor, not remove it. It still appears, placed once on
// row entry.
const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

const subscribeMotion = (onChange: () => void) => {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const getMotion = () => window.matchMedia(MOTION_QUERY).matches;
// The server render, and the first client render that hydrates it, place once.
const getServerMotion = () => false;

// Keying off the actual input capability, not guessing from viewport width.
// b656b3b shipped the CSS gate at 640px (the receipt plan's table says 900);
// 640 is the shipped number.
const CAPABILITY_QUERY = "(hover: hover) and (min-width: 640px)";

interface PlacementInput {
  x: number;
  y: number;
  width: number;
  height: number;
  viewportW: number;
  viewportH: number;
}

// Pure: given the cursor position, the panel's measured border-box size and the
// viewport, return the top-left the .anchor should be translated to. Split out
// so the math reads in isolation.
export function computePlacement({
  x,
  y,
  width,
  height,
  viewportW,
  viewportH,
}: PlacementInput): { x: number; y: number } {
  // Vertical: below the cursor, flipped above it when the panel (shadow
  // included) would pass the bottom of the viewport, then never above the top.
  let panelY = y + OFFSET;
  if (panelY + height + SHADOW + MARGIN > viewportH) {
    panelY = y - OFFSET - height;
  }
  panelY = Math.max(panelY, MARGIN);

  // Horizontal: right of the cursor, clamped so the shadow stays inside the
  // viewport. body { overflow-x: hidden } would silently slice an overflow
  // rather than let it scroll, so this clamp is required, not polish. Near the
  // right edge the panel slides under the cursor - harmless, pointer-events is
  // none so it can't steal the hover.
  const maxX = viewportW - width - SHADOW - MARGIN;
  const panelX = Math.min(Math.max(x + OFFSET, MARGIN), Math.max(maxX, MARGIN));

  return { x: panelX, y: panelY };
}

interface RowHandlers {
  onMouseEnter: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
  onFocus: (e: FocusEvent<HTMLDivElement>) => void;
  onBlur: () => void;
}

interface PanelProps {
  ref: (node: HTMLDivElement | null) => void;
  "data-visible": boolean;
}

export function usePostPreview() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const trackCursor = useSyncExternalStore(
    subscribeMotion,
    getMotion,
    getServerMotion,
  );

  // activeSlug is also read from event handlers that don't re-subscribe, so
  // setActive writes it to a ref as well, which they read without it being in a
  // dep array.
  const activeSlugRef = useRef<string | null>(null);
  const setActive = useCallback((slug: string | null) => {
    activeSlugRef.current = slug;
    setActiveSlug(slug);
  }, []);

  const anchors = useRef(new Map<string, HTMLDivElement>());
  const refCache = useRef(
    new Map<string, (n: HTMLDivElement | null) => void>(),
  );
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number | null>(null);
  const panelSize = useRef<{ width: number; height: number } | null>(null);
  const cursor = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const clearShow = useCallback(() => {
    if (showTimer.current !== null) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
  }, []);

  const clearHide = useCallback(() => {
    if (hideTimer.current !== null) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  // Write the placement transform straight to the .anchor node - no React
  // render. Uses documentElement.clientWidth/Height, not window.innerWidth, so
  // scrollbars are excluded.
  const applyPlacement = useCallback((slug: string) => {
    const node = anchors.current.get(slug);
    const size = panelSize.current;
    if (!node || !size) return;
    const { x, y } = computePlacement({
      x: cursor.current.x,
      y: cursor.current.y,
      width: size.width,
      height: size.height,
      viewportW: document.documentElement.clientWidth,
      viewportH: document.documentElement.clientHeight,
    });
    node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, []);

  // Per-frame tracking only. The FIRST placement of an activation must be
  // synchronous (see reveal()) or the fixed .anchor paints one frame at its
  // top:0/left:0 origin before the rAF moves it to the cursor.
  const scheduleTrack = useCallback(
    (slug: string) => {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        applyPlacement(slug);
      });
    },
    [applyPlacement],
  );

  // Measure once per activation (getBoundingClientRect is a forced layout read;
  // content is fixed for the hover's duration so caching it is safe - and the
  // rect is valid despite visibility: hidden, which is why the hidden state
  // isn't display: none). Place synchronously, then reveal via state.
  const reveal = useCallback(
    (slug: string) => {
      const node = anchors.current.get(slug);
      if (!node) return;
      const rect = node.getBoundingClientRect();
      panelSize.current = { width: rect.width, height: rect.height };
      applyPlacement(slug);
      setActive(slug);
    },
    [applyPlacement, setActive],
  );

  const hide = useCallback(() => {
    clearShow();
    if (hideTimer.current !== null) return;
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      panelSize.current = null;
      setActive(null);
    }, HIDE_GRACE);
  }, [clearShow, setActive]);

  // Capability gate. matchMedia lives in an effect so SSR and the first client
  // render agree (enabled: false, no handlers attached).
  useEffect(() => {
    const mq = window.matchMedia(CAPABILITY_QUERY);
    const sync = (matches: boolean) => {
      setEnabled(matches);
      if (!matches) {
        clearShow();
        clearHide();
        setActive(null);
      }
    };
    sync(mq.matches);
    const onChange = (e: MediaQueryListEvent) => sync(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [clearShow, clearHide, setActive]);

  // Coordinates are viewport-relative and the panel is fixed, so a scroll
  // without a mouse move would strand it beside a row that has moved. Hiding is
  // the calmest fix.
  useEffect(() => {
    if (!enabled || activeSlug === null) return;
    const onScroll = () => {
      clearShow();
      clearHide();
      panelSize.current = null;
      setActive(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled, activeSlug, clearShow, clearHide, setActive]);

  useEffect(
    () => () => {
      clearShow();
      clearHide();
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    },
    [clearShow, clearHide],
  );

  const getRowProps = useCallback(
    (slug: string): RowHandlers | Record<string, never> => {
      if (!enabled) return {};
      return {
        onMouseEnter: (e) => {
          cursor.current = { x: e.clientX, y: e.clientY };
          clearHide();
          if (activeSlugRef.current === slug) return;
          clearShow();
          showTimer.current = setTimeout(() => {
            showTimer.current = null;
            reveal(slug);
          }, SHOW_DELAY);
        },
        onMouseMove: (e) => {
          cursor.current = { x: e.clientX, y: e.clientY };
          if (TRACK_CURSOR && trackCursor && activeSlugRef.current === slug) {
            scheduleTrack(slug);
          }
        },
        onMouseLeave: hide,
        onFocus: (e) => {
          // Keyboard parity with the old :focus-within reveal: feed placement
          // the row's own rect so flip and clamp apply identically, and skip
          // the dwell timer - tabbing shouldn't wait.
          const rect = e.currentTarget.getBoundingClientRect();
          cursor.current = { x: rect.left, y: rect.bottom };
          clearShow();
          clearHide();
          reveal(slug);
        },
        onBlur: hide,
      };
    },
    [enabled, trackCursor, hide, reveal, scheduleTrack, clearShow, clearHide],
  );

  const getPanelProps = useCallback(
    (slug: string): PanelProps => {
      let ref = refCache.current.get(slug);
      if (!ref) {
        ref = (node: HTMLDivElement | null) => {
          if (node) anchors.current.set(slug, node);
          else anchors.current.delete(slug);
        };
        refCache.current.set(slug, ref);
      }
      return { ref, "data-visible": activeSlug === slug };
    },
    [activeSlug],
  );

  return { activeSlug, getRowProps, getPanelProps };
}
