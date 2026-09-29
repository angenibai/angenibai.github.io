import { useRouter } from "next/router";
import { useEffect } from "react";

// TypeScript 5.1's DOM lib predates the View Transitions API.
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<unknown>) => unknown;
};

// With reduced motion on, the hook does nothing and Next navigates as normal.
const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

const pathOf = (url: URL | Location) => url.pathname + url.search;

// Animates between pages (animation in globals.css). The browser captures the
// old page before calling the startViewTransition callback, so the navigation
// has to happen inside that callback. That's why this hook handles link clicks
// and Back/Forward itself instead of listening for routeChangeStart: by then a
// prefetched page can render before the capture, and the transition hangs.
const useRouteTransition = () => {
  const router = useRouter();

  useEffect(() => {
    const doc = document as ViewTransitionDocument;
    const startViewTransition = doc.startViewTransition?.bind(doc);
    if (!startViewTransition) {
      return;
    }
    const shouldAnimate = () => window.matchMedia(MOTION_QUERY).matches;

    // Listens in the capture phase so it runs before next/link's click
    // handler. Calling preventDefault() makes next/link skip its navigation.
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !shouldAnimate()
      ) {
        return;
      }
      const link = (event.target as Element).closest("a");
      if (
        !link ||
        (link.target && link.target !== "_self") ||
        link.hasAttribute("download")
      ) {
        return;
      }
      const url = new URL(link.href);
      // Links to the current page, like the skip link, are left to Next.
      if (
        url.origin !== window.location.origin ||
        pathOf(url) === pathOf(window.location)
      ) {
        return;
      }
      event.preventDefault();
      startViewTransition(() => router.push(pathOf(url) + url.hash));
    };

    // Returning false stops Next handling Back/Forward itself; the replace()
    // call is what Next would have done.
    router.beforePopState(({ url, as, options }) => {
      if (!shouldAnimate()) {
        return true;
      }
      startViewTransition(() => router.replace(url, as, options));
      return false;
    });

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      router.beforePopState(() => true);
    };
  }, [router]);
};

export default useRouteTransition;
