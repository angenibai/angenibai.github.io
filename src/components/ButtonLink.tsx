import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect, useState } from "react";
import styles from "@/styles/components/Button.module.css";

interface ButtonLinkProps {
  href: string;
  external?: boolean;
  isSelected?: boolean;
}

const ButtonLink = ({
  children,
  href,
  external = false,
  isSelected = false,
}: PropsWithChildren<ButtonLinkProps>) => {
  const router = useRouter();

  // isSelected comes from the router, so it only flips once the route lands,
  // leaving a gap after mouseup where the button would spring back up. .pressed
  // holds it down across that gap. Set on click rather than pointerdown so a
  // press that gets dragged off and cancelled never latches.
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (isSelected) {
      setPressed(false);
    }
  }, [isSelected]);

  // Release valve for navigations that never leave this button selected.
  useEffect(() => {
    if (!pressed) {
      return;
    }
    const release = () => setPressed(false);
    router.events.on("routeChangeComplete", release);
    router.events.on("routeChangeError", release);
    return () => {
      router.events.off("routeChangeComplete", release);
      router.events.off("routeChangeError", release);
    };
  }, [pressed, router.events]);

  const handleClick = () => {
    if (!isSelected) {
      setPressed(true);
    }
  };

  const className = `${styles.button} ${isSelected ? styles.selected : ""} ${
    pressed ? styles.pressed : ""
  }`;

  return external ? (
    <a href={href} target="_blank" className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default ButtonLink;
