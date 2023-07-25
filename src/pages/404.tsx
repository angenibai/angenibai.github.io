import Link from "next/link";

import styles from "@/styles/Error.module.css";

const Custom404 = () => {
  return (
    <div className={styles.errorPage}>
      <h1 className={styles.heading}>404 NOT FOUND</h1>
      <p className={styles.subheading}>
        it's ok, you can go <Link href="/">back home</Link>
      </p>
    </div>
  );
};

export default Custom404;
