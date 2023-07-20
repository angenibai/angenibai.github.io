import { PropsWithChildren } from "react";

import Nav from "./Nav";
import styles from "@/styles/components/Layout.module.css";

interface LayoutProps {}

const Layout = (props: PropsWithChildren<LayoutProps>) => {
  const { children } = props;

  return (
    <div>
      <Nav />
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;
