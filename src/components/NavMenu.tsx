import { useEffect, useRef, useState } from "react";
import type { FocusEvent, MouseEvent } from "react";

import buttonStyles from "@/styles/components/Button.module.css";
import styles from "@/styles/components/Nav.module.css";
import NavLinks from "./NavLinks";

const MENU_ID = "nav-menu";

// Mobile-only (hidden above 640px in Nav.module.css). A disclosure rather than
// an ARIA menu: plain links, no arrow-key semantics to live up to.
const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    menuRef.current?.querySelector("a")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      setIsOpen(false);
      buttonRef.current?.focus();
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (wrapperRef.current?.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  // Closes when Tab moves focus past the menu. A null relatedTarget (a tap on
  // something unfocusable, or Safari not focusing the button on tap) is left to
  // the pointerdown handler, or tapping "close" would close then reopen.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next && !event.currentTarget.contains(next)) {
      setIsOpen(false);
    }
  };

  // Following a link closes it. The current page's link does nothing, as on
  // desktop, so the menu stays open.
  const handleMenuClick = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as HTMLElement).closest("a");
    if (link && link.getAttribute("aria-current") !== "page") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} onBlur={handleBlur}>
      <button
        ref={buttonRef}
        type="button"
        className={`${buttonStyles.button} ${styles.menuButton}`}
        // Fixed name; aria-expanded carries open/closed.
        aria-label="Menu"
        aria-expanded={isOpen}
        aria-controls={MENU_ID}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <span className={styles.hamburger} aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
      {/* Delegated from the links inside: Enter on a focused link fires the
          same click, so keyboard users already get this behaviour. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        ref={menuRef}
        id={MENU_ID}
        className={`${styles.menu} ${isOpen ? styles.menuOpen : ""}`}
        onClick={handleMenuClick}
      >
        <NavLinks className={styles.menuNav} />
      </div>
    </div>
  );
};

export default NavMenu;
