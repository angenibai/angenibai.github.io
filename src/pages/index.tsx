import BioPanel from "@/components/BioPanel";

import styles from "@/styles/Home.module.css";

export default function Home() {
  return (
    <>
      <div className={styles.homePage}>
        <div className={styles.contentDiv}>
          <p className={styles.bigText}>
            welcome to angeni's corner of the internet!
          </p>
          <p className={styles.text}>
            {"this site is best enjoyed in light mode :)"}
          </p>
        </div>
        <div className={styles.bioDiv}>
          <BioPanel />
        </div>
      </div>
    </>
  );
}
