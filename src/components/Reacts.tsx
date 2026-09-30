import dynamic from "next/dynamic";

import styles from "@/styles/components/Reacts.module.css";

// The Firebase SDK is large, so the panel loads as its own chunk after the
// page has rendered and hydrated. ssr: false because it only works in the
// browser.
const ReactsPanel = dynamic(() => import("./ReactsPanel"), { ssr: false });

// The wrapper draws the post column's bottom edge, so it renders even while
// the panel is loading or hidden.
const Reacts = ({ slug }: { slug: string }) => (
  <div className={styles.reacts}>
    <ReactsPanel slug={slug} />
  </div>
);

export default Reacts;
