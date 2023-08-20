import Link from "next/link";

import styles from "@/styles/Error.module.css";
import { NextSeo } from "next-seo";
import PageLayout from "@/components/PageLayout";

const Custom404 = () => {
  return (
    <>
      <PageLayout>
        <NextSeo title="404 | angeni bai" />
        <div className={styles.errorPage}>
          <h1 className={styles.heading}>404 NOT FOUND</h1>
          <p className={styles.subheading}>
            it's ok, you can go <Link href="/">back home</Link>
          </p>
        </div>
      </PageLayout>
    </>
  );
};

export default Custom404;
