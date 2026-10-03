import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import styles from "@/styles/components/Nav.module.css";
import NavLinks from "./NavLinks";
import NavMenu from "./NavMenu";

interface NavProps {
  readingProgress?: boolean;
}

const Nav = ({ readingProgress }: NavProps) => {
  const mastheadRef = useRef<HTMLElement>(null);
  // Starts true so the running head is hidden on first paint and during SSR.
  const [isMastheadVisible, setIsMastheadVisible] = useState(true);

  useEffect(() => {
    const masthead = mastheadRef.current;
    if (!masthead) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) =>
      setIsMastheadVisible(entry.isIntersecting),
    );
    observer.observe(masthead);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* stillHeader keeps the masthead in place during page transitions
          (see useRouteTransition.ts). It's only applied while the masthead is
          on screen: when the page is scrolled down, the masthead is above the
          viewport, and it would slide down into place on the next page.
          Instead, the running head fades out with the rest of the page. */}
      <header
        ref={mastheadRef}
        className={`${styles.header} ${
          isMastheadVisible ? styles.stillHeader : ""
        }`}
      >
        <div className={styles.websiteTitle}>
          <Link className="sneakyLink titleHeader" href="/">
            angeni bai
          </Link>
        </div>
        <div className={styles.slashDivider} aria-hidden="true"></div>
        <NavLinks className={styles.mastheadNav} />
      </header>
      <div
        className={`${styles.runningHead} ${
          isMastheadVisible ? "" : styles.runningHeadShown
        } ${readingProgress ? styles.readingProgress : ""}`}
      >
        <div className={styles.runningHeadTitle}>
          <Link className="sneakyLink" href="/">
            angeni bai
          </Link>
        </div>
        <div className={styles.runningHeadSlash} aria-hidden="true"></div>
        <NavLinks className={styles.runningHeadNav} />
      </div>
      {readingProgress && (
        <div className={styles.progressStrip} aria-hidden="true" />
      )}
      <NavMenu />
    </>
  );
};

export default Nav;
