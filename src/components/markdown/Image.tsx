import { ComponentPropsWithoutRef } from "react";
import styles from "@/styles/components/Image.module.css";

// Wrapped in a span (not a div) because markdown images can end up inline
// inside a <p>; a div there would be invalid HTML and break hydration.
const Image = ({ alt, ...props }: ComponentPropsWithoutRef<"img">) => (
  <span className={styles.imageWrapper}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img alt={alt || ""} {...props} loading="lazy" />
  </span>
);

export default Image;
