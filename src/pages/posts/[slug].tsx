import PageLayout from "@/components/PageLayout";
import { getImageDimensions, getPaths, getPostBySlug } from "@/lib/api";
import { PostData } from "@/types";
import { GetStaticProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { ArticleJsonLd, NextSeo } from "next-seo";
import site, { absoluteUrl } from "@/lib/site";
import ReactMarkdown from "react-markdown";
import NextImage from "next/image";
import styles from "@/styles/Post.module.css";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Code, { CodeBlock } from "@/components/markdown/Code";
import Image from "@/components/markdown/Image";
import Reacts from "@/components/Reacts";

interface Params extends ParsedUrlQuery {
  slug: string;
}

const Post = ({ slug, source, metadata, splashImageDimensions }: PostData) => {
  const url = absoluteUrl(`/posts/${slug}`);
  const image = metadata.splashImageSource
    ? {
        url: absoluteUrl(metadata.splashImageSource),
        ...splashImageDimensions,
        alt: metadata.splashImageCaption || metadata.title,
      }
    : null;
  const showReacts = !metadata.externalLink && metadata.reacts !== false;

  return (
    <>
      <PageLayout readingProgress>
        <NextSeo
          title={`${metadata.title} | angeni bai`}
          description={metadata.blurb}
          canonical={url}
          noindex={metadata.index === false}
          openGraph={{
            type: "article",
            url,
            title: metadata.title,
            description: metadata.blurb,
            article: {
              publishedTime: metadata.date,
              modifiedTime: metadata.updated ?? undefined,
              tags: metadata.tags,
            },
            images: image ? [image] : [],
          }}
          twitter={{ cardType: image ? "summary_large_image" : "summary" }}
        />
        <ArticleJsonLd
          type="BlogPosting"
          url={url}
          title={metadata.title}
          description={metadata.blurb ?? ""}
          images={image ? [image.url] : []}
          datePublished={metadata.date}
          dateModified={metadata.updated ?? undefined}
          authorName={metadata.author?.name ?? site.author}
        />
        <div className={styles.postHeading}>
          <div className={styles.postHeadingText}>
            <h1 className={styles.postTitle}>{metadata.title}</h1>
            <p className={styles.postSubtitle}>
              Published{" "}
              {new Date(metadata.date).toLocaleDateString("en-au", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          {metadata.splashImageSource &&
            (splashImageDimensions ? (
              <div className={styles.postHeadingImageWrap}>
                <NextImage
                  src={metadata.splashImageSource}
                  alt={metadata.splashImageCaption || ""}
                  width={splashImageDimensions.width}
                  height={splashImageDimensions.height}
                  priority
                />
              </div>
            ) : (
              <div className={styles.postHeadingImageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={metadata.splashImageSource}
                  alt={metadata.splashImageCaption || ""}
                  loading="lazy"
                />
              </div>
            ))}
        </div>
        <div
          className={`${styles.postContent} ${showReacts ? styles.hasReacts : ""}`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              pre: CodeBlock,
              code: Code,
              img: Image,
            }}
          >
            {source}
          </ReactMarkdown>
        </div>
        {/* key resets the pressed state when navigating between posts. */}
        {showReacts && <Reacts key={slug} slug={slug} />}
      </PageLayout>
    </>
  );
};

export default Post;

export const getStaticProps: GetStaticProps<PostData, Params> = async ({
  params,
}) => {
  const post = getPostBySlug(params!.slug);
  const { splashImageSource } = post.metadata;

  return {
    props: {
      ...post,
      splashImageDimensions: splashImageSource
        ? getImageDimensions(splashImageSource)
        : null,
    },
  };
};

export const getStaticPaths = async () => {
  const paths = getPaths();

  return {
    paths,
    fallback: false,
  };
};
