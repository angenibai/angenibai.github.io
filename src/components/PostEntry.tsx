import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/components/PostEntry.module.css";
import { PostData } from "@/types";

interface PostEntryProps {
  post: PostData;
  index: number;
}

const formatIndex = (index: number) => `No. ${String(index).padStart(2, "0")}`;

const formatDate = (date: string) =>
  new Date(date)
    .toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/-/g, " · ");

const PostEntry = ({ post, index }: PostEntryProps) => {
  const { slug, metadata } = post;

  if (!slug || !metadata) {
    return null;
  }

  const hasTags = !!metadata.tags?.length;
  const hasCoauthors = !!metadata.coauthors?.length;

  return (
    <Link href={`/posts/${slug}`} className={styles.entry}>
      <div className={styles.textColumn}>
        <div>
          <div className={styles.eyebrow}>
            <span className={styles.mono}>{formatIndex(index)}</span>
            <span className={styles.mono}>{formatDate(metadata.date)}</span>
          </div>
          <h2 className={styles.title}>{metadata.title}</h2>
          {metadata.blurb && <p className={styles.blurb}>{metadata.blurb}</p>}
        </div>
        {(hasTags || hasCoauthors) && (
          <div className={styles.metaGrid}>
            {hasTags && (
              <div className={styles.metaCell}>
                <span className={`${styles.mono} ${styles.metaLabel}`}>
                  Filed under
                </span>
                <span className={styles.metaValue}>
                  {metadata.tags!.join(", ")}
                </span>
              </div>
            )}
            {hasCoauthors && (
              <div className={styles.metaCell}>
                <span className={`${styles.mono} ${styles.metaLabel}`}>
                  With
                </span>
                <span className={styles.metaValue}>
                  {metadata.coauthors!.map((name) => (
                    <span className={styles.metaLine} key={name}>
                      {name}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      {metadata.splashImageSource && (
        <div className={styles.thumbWrap}>
          <Image
            src={metadata.splashImageSource}
            alt={metadata.splashImageCaption || metadata.title}
            width={260}
            height={195}
          />
        </div>
      )}
    </Link>
  );
};

export default PostEntry;
