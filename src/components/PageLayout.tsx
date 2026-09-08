import { PropsWithChildren } from "react";

import Nav from "./Nav";
import styles from "@/styles/components/Layout.module.css";
import Footer from "./Footer";

interface PageLayoutProps {}

const PageLayout = (props: PropsWithChildren<PageLayoutProps>) => {
  const { children } = props;

  return (
    <div>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main-content" className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
