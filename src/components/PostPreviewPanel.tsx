import { Ref } from "react";
import Image from "next/image";
import styles from "@/styles/components/PostPreviewPanel.module.css";
import { PostListItem } from "@/types";

interface PostPreviewPanelProps {
  post: PostListItem;
  "data-visible"?: boolean;
  ref?: Ref<HTMLDivElement>;
}

// Forked from BioPanel rather than parameterised out of it - same look, but a
// different data shape, and generalising one small panel costs more than the
// duplicated markup.
//
// Two nested elements on purpose. The outer .anchor carries position: fixed and
// the per-frame placement transform that usePostPreview writes through the
// `ref` prop, with NO transition. The inner .panel keeps all appearance plus
// the 0.12s entrance. On one element the entrance ease would apply to placement
// too and the panel would visibly trail the cursor.
export default function PostPreviewPanel({
  post,
  "data-visible": dataVisible,
  ref,
}: PostPreviewPanelProps) {
  const { metadata, excerpt } = post;

  if (!metadata) {
    return null;
  }

  return (
    <div ref={ref} className={styles.anchor} data-visible={dataVisible}>
      {/* aria-hidden, and alt="", because everything here is repeated on the
          post page the row already links to. */}
      <div className={styles.panel} aria-hidden="true">
        <div className={styles.header}>
          <h3 className={styles.headerTitle}>{metadata.title}</h3>
        </div>
        {metadata.splashImageSource && (
          <div className={styles.imageFrame}>
            {/* next/image needs both dimensions, but the real intrinsic size
                isn't known without reading the file. 640x480 is an upper-bound
                hint that only drives srcset selection and the pre-load ratio
                reservation - the rendered ratio comes from CSS below, resolved
                against the actual image, so nothing is cropped. */}
            <Image
              src={metadata.splashImageSource}
              alt=""
              width={640}
              height={480}
            />
          </div>
        )}
        {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
        {!!metadata.coauthors?.length && (
          <p className={styles.with}>
            <span className={styles.withLabel}>with</span>
            {metadata.coauthors.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
