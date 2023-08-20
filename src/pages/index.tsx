import BioPanel from "@/components/BioPanel";
import Layout from "@/components/Layout";
import NavLinks from "@/components/NavLinks";

import styles from "@/styles/Home.module.css";

export default function Home() {
  return (
    <>
      <Layout>
        <div className={styles.homePage}>
          <div className={styles.contentDiv}>
            <h3 className={styles.bigText}>
              welcome to angeni's corner of the internet!
            </h3>
            <p className={styles.text}>
              {"this site is best enjoyed in light mode :)"}
            </p>
            <div className={styles.navLinks}>
              <NavLinks />
            </div>
          </div>
          <div className={styles.bioDiv}>
            <BioPanel />
          </div>
        </div>
      </Layout>
    </>
  );
}
