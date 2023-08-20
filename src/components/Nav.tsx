import Link from "next/link";

import styles from "@/styles/components/Nav.module.css";
import NavLinks from "./NavLinks";

const Nav = () => {
  return (
    <header className={styles.header}>
      <div className={styles.websiteTitle}>
        <Link className="sneakyLink" href="/">
          angeni bai
        </Link>
      </div>
      {/* <nav className={styles.nav}>
        <div className={styles.navItem}>
          <Link href="/">home</Link>
        </div>
        <div className={styles.navItem}>
          <Link href="/projects">projects</Link>
        </div>
        <div className={styles.navItem}>
          <Link href="/posts">posts</Link>
        </div>
      </nav> */}
      <NavLinks />
    </header>
  );
};

export default Nav;
