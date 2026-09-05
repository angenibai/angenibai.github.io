import NextLink from "next/link";
import styles from "@/styles/components/PostEntry.module.css";
import { PostListItem } from "@/types";

interface PostEntryProps {
  post: PostListItem;
}

const formatDate = (date: string) =>
  new Date(date)
    .toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/-/g, " · ");

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
        <h2 className={styles.title}>{metadata.title}</h2>
        <span className={styles.leader} aria-hidden="true" />
        <span className={styles.date}>{formatDate(metadata.date)}</span>
      </span>
      {metadata.blurb && <p className={styles.blurb}>{metadata.blurb}</p>}
    </Link>
  );
};

export default PostEntry;
