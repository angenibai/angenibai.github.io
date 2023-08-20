import Link from "next/link";
import { PropsWithChildren } from "react";
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
  return external ? (
    <a
      href={href}
      target="_blank"
      className={`${styles.button} ${isSelected && styles.selected}`}
    >
      {children}
    </a>
  ) : (
    <Link
      href={href}
      className={`${styles.button} ${isSelected && styles.selected}`}
    >
      {children}
    </Link>
  );
};

export default ButtonLink;
