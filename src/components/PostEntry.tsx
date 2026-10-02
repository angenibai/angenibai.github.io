import NextLink from "next/link";
import styles from "@/styles/components/PostEntry.module.css";
import { PostListItem } from "@/types";

interface PostEntryProps {
  post: PostListItem;
}

// Sliced from the ISO string rather than formatted in local time, because the
// stored date is UTC midnight and would shift a day west of UTC.
const formatDate = (iso: string) => `${iso.slice(8, 10)} · ${iso.slice(5, 7)}`;

const formatFullDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const PostEntry = ({ post }: PostEntryProps) => {
  const { slug, metadata } = post;

  if (!slug || !metadata) {
    return null;
  }

  const Link = metadata.externalLink ? "a" : NextLink;
  const href = metadata.externalLink ? metadata.externalLink : `/posts/${slug}`;

  return (
    <Link href={href} className={styles.entry}>
      {metadata.pin && <span className={styles.pin} aria-hidden="true" />}
      <span className={styles.line}>
        <h3 className={styles.title}>{metadata.title}</h3>
        <time
          className={styles.date}
          dateTime={metadata.date.slice(0, 10)}
          aria-label={formatFullDate(metadata.date)}
        >
          {formatDate(metadata.date)}
        </time>
      </span>
      {metadata.blurb && <p className={styles.blurb}>{metadata.blurb}</p>}
    </Link>
  );
};

export default PostEntry;
