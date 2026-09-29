import { useEffect, useState } from "react";
import { doc, increment, onSnapshot, updateDoc } from "firebase/firestore";

import { REACTS, ReactKey, getReactsDb, reactsDocId } from "@/lib/reacts";
import styles from "@/styles/components/Reacts.module.css";

type Counts = Record<ReactKey | "total", number>;

const HEADING_ID = "reacts-heading";

const Reacts = ({ slug }: { slug: string }) => {
  // null while loading, "missing" if the post has no doc yet.
  const [counts, setCounts] = useState<Counts | "missing" | null>(null);
  // In-page only, so reacting again after a reload is allowed.
  const [pressed, setPressed] = useState<Set<ReactKey>>(new Set());

  const docId = reactsDocId(slug);

  useEffect(() => {
    const ref = doc(getReactsDb(), "reacts", docId);
    return onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.warn(
            `No reacts doc "${docId}", so the react bar is hidden. Run npm run reacts:init.`,
          );
          setCounts("missing");
          return;
        }
        setCounts(snapshot.data() as Counts);
      },
      (error) => console.error(`Couldn't load reacts for ${docId}`, error),
    );
  }, [docId]);

  // The wrapper draws the post column's bottom edge, so it renders even
  // while the panel is loading or hidden.
  if (counts === null || counts === "missing") {
    return <div className={styles.reacts} />;
  }

  const togglePressed = (key: ReactKey) =>
    setPressed((previous) => {
      const next = new Set(previous);
      if (!next.delete(key)) {
        next.add(key);
      }
      return next;
    });

  // Counts come from the snapshot. Firestore applies local writes to it
  // straight away, so there's no separate optimistic count.
  const handleClick = (key: ReactKey) => {
    const delta = pressed.has(key) ? -1 : 1;
    togglePressed(key);
    updateDoc(doc(getReactsDb(), "reacts", docId), {
      [key]: increment(delta),
      total: increment(delta),
    }).catch((error) => {
      // Revert, since the rules or the network refused the write.
      togglePressed(key);
      console.error(`Couldn't record react "${key}" on ${docId}`, error);
    });
  };

  return (
    <div className={styles.reacts}>
      <section aria-labelledby={HEADING_ID} className={styles.panel}>
        <div className={styles.head}>
          <h2 id={HEADING_ID} className={styles.heading}>
            Reacc
          </h2>
          <p className={styles.total}>
            {counts.total} {counts.total === 1 ? "response" : "responses"}
          </p>
        </div>
        <div className={styles.row}>
          {/* The label is visually hidden, so each button reads as "Like 4". */}
          {REACTS.map(({ key, emoji, label }) => (
            <button
              key={key}
              type="button"
              className={styles.cell}
              aria-pressed={pressed.has(key)}
              onClick={() => handleClick(key)}
            >
              <span className={styles.emoji} aria-hidden="true">
                {emoji}
              </span>
              <span className="visually-hidden">{label}</span>
              <span className={styles.count}>{counts[key]}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Reacts;
