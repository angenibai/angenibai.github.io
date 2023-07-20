import Link from "next/link";

import styles from "@/styles/components/Nav.module.css";

const Nav = () => {
  return (
    <header>
      <Link href="/" className={styles.websiteTitle}>
        angeni bai
      </Link>
      <nav>
        <div>
          <Link href="/">home</Link>
        </div>
        <div>
          <Link href="/projects">projects</Link>
        </div>
        <div>
          <Link href="/posts">posts</Link>
        </div>
      </nav>
    </header>
  );
};

export default Nav;
