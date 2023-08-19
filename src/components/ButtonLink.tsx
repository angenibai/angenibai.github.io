import Link, { LinkProps } from "next/link";
import { PropsWithChildren } from "react";
import styles from "@/styles/components/Button.module.css";

interface ButtonLinkProps {
  href: string;
  external?: boolean;
}

const ButtonLink = ({
  children,
  href,
  external = false,
}: PropsWithChildren<ButtonLinkProps>) => {
  return external ? (
    <a href={href} target="_blank" className={styles.button}>
      {children}
    </a>
  ) : (
    <Link href={href} className={styles.button}>
      {children}
    </Link>
  );
};

export default ButtonLink;
