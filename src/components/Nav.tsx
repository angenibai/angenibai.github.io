import Link from "next/link";

import styles from "@/styles/components/Nav.module.css";

const Nav = () => {
  return (
    <header className={styles.header}>
      <div className={styles.websiteTitle}>
        <Link href="/">angeni bai</Link>
      </div>
      <nav className={styles.nav}>
        <div className={styles.navItem}>
          <Link href="/">home</Link>
        </div>
        <div className={styles.navItem}>
          <Link href="/projects">projects</Link>
        </div>
        <div className={styles.navItem}>
          <Link href="/posts">posts</Link>
        </div>
      </nav>
    </header>
  );
};

export default Nav;
