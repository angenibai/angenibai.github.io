import BioPanel from "@/components/BioPanel";
import Layout from "@/components/Layout";
import NavLinks from "@/components/NavLinks";
import site, { absoluteUrl } from "@/lib/site";
import { NextSeo, SocialProfileJsonLd } from "next-seo";

import styles from "@/styles/Home.module.css";

export default function Home() {
  return (
    <>
      <Layout>
        <NextSeo
          canonical={absoluteUrl("/")}
          openGraph={{ url: absoluteUrl("/") }}
        />
        <SocialProfileJsonLd
          type="Person"
          name={site.author}
          url={absoluteUrl("/")}
          sameAs={site.socialProfiles}
        />
        <div className={styles.homePage}>
          <div className={styles.contentDiv}>
            <h1 className={styles.bigText}>
              {"welcome to angeni's corner of the internet :)"}
            </h1>
            <p className={styles.text}>
              {"this site is best enjoyed in light mode"}
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
