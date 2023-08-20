import { PropsWithChildren } from "react";

import Nav from "./Nav";
import styles from "@/styles/components/Layout.module.css";

interface PageLayoutProps {}

const PageLayout = (props: PropsWithChildren<PageLayoutProps>) => {
  const { children } = props;

  return (
    <div>
      <Nav />
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default PageLayout;
