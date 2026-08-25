import Link from "next/link";

import styles from "@/styles/components/Nav.module.css";
import NavLinks from "./NavLinks";

const Nav = () => {
  return (
    <header className={styles.header}>
      <div className={styles.websiteTitle}>
        <Link className="sneakyLink titleHeader" href="/">
          angeni bai
        </Link>
      </div>
      <div className={styles.slashDivider} aria-hidden="true"></div>
      <NavLinks />
    </header>
  );
};

export default Nav;
