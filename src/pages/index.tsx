import BioPanel from "@/components/BioPanel";
import Head from "next/head";

import styles from "@/styles/Home.module.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>angeni bai</title>
        <meta name="description" content="Angeni's website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.homePage}>
        <div className={styles.contentDiv}>
          <p className={styles.bigText}>
            welcome to angeni's corner of the internet!
          </p>
          <p className={styles.text}>
            {"This site is best enjoyed in light mode :)"}
          </p>
        </div>
        <div className={styles.bioDiv}>
          <BioPanel />
        </div>
      </div>
    </>
  );
}
