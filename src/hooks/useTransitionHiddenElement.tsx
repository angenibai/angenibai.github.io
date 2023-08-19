import { useEffect, useState } from "react";

interface TransitionOptions {
  element: HTMLElement | null;
  visibleClass: string;
  waitMode?: "transitionend" | "timeout" | "immediate";
  timeoutDuration?: number;
  hideMode?: "hidden" | "display";
  displayValue?: string;
}

const useTransitionHiddenElement = ({
  element,
  visibleClass,
  waitMode = "transitionend",
  timeoutDuration,
  hideMode = "hidden",
  displayValue = "block",
}: TransitionOptions) => {
  if (!element) {
    throw new Error("element is null");
  }

  const [timeoutRef, setTimeoutRef] = useState<NodeJS.Timeout | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Don't wait for exit transitions if a user prefers reduced motion.
  // Ideally transitions will be disabled in CSS, which means we should not wait
  // before adding `hidden`.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    waitMode = "immediate";
  }

  const applyHiddenAttributes = () => {
    if (hideMode === "display") {
      element.style.display = "none";
    } else {
      element.setAttribute("hidden", "true");
    }
  };

  const removeHiddenAttributes = () => {
    if (hideMode === "display") {
      element.style.display = displayValue;
    } else {
      element.removeAttribute("hidden");
    }
  };

  /**
   * An event listener to add `hidden` after our animations complete.
   * This listener will remove itself after completing.
   */
  const listener = (e: Event) => {
    // Confirm `transitionend` was called on our `element` and didn't bubble
    // up from a child element.
    if (e.target === element) {
      applyHiddenAttributes();

      element.removeEventListener("transitionend", listener);
    }
  };

  /**
   * Show element
   */
  const show = () => {
    // remove listener in case toggle is spammed
    element.removeEventListener("transitionend", listener);

    // clear timeout
    if (timeoutRef) {
      clearTimeout(timeoutRef);
    }

    removeHiddenAttributes();

    setIsVisible(true);

    element.classList.add(visibleClass);
  };

  /**
   * Hide element
   */
  const hide = () => {
    if (waitMode === "transitionend") {
      element.addEventListener("transitionend", listener);
    } else if (waitMode === "timeout") {
      setTimeoutRef(
        setTimeout(() => {
          applyHiddenAttributes();
        }, timeoutDuration)
      );
    } else {
      applyHiddenAttributes();
    }

    setIsVisible(false);
  };

  /**
   * Check whether element is hidden or not
   */
  const isHidden = () => {
    const hasHiddenAttribute = element.getAttribute("hidden") !== null;

    const isDisplayNone = element.style.display === "none";

    const hasVisibleClass = element.classList.contains(visibleClass);

    return hasHiddenAttribute || isDisplayNone || !hasVisibleClass;
  };

  /**
   * Toggle visibility
   */
  const toggle = () => {
    if (isHidden()) {
      show();
    } else {
      hide();
    }
  };

  useEffect(() => {
    setIsVisible(!isHidden());
  }, [element]);

  return { show, hide, toggle, isHidden };
};

export default useTransitionHiddenElement;
