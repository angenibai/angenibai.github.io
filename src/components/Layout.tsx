import { PropsWithChildren } from "react";

import styles from "@/styles/components/Layout.module.css";

interface LayoutProps {}

const Layout = (props: PropsWithChildren<LayoutProps>) => {
  const { children } = props;

  return (
    <div>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;
