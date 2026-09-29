import PageLayout from "@/components/PageLayout";
import { getFileData, getImageDimensions, getPaths } from "@/lib/api";
import { PostData } from "@/types";
import { GetStaticProps, GetStaticPropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import matter from "gray-matter";
import { ArticleJsonLd, NextSeo } from "next-seo";
import site, { absoluteUrl } from "@/lib/site";
import {
  PluggableList,
  ReactMarkdown,
} from "react-markdown/lib/react-markdown";
import NextImage from "next/image";
import styles from "@/styles/Post.module.css";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Code from "@/components/markdown/Code";
import Image from "@/components/markdown/Image";

interface Params extends ParsedUrlQuery {
  slug: string;
}

const Post = ({ slug, source, metadata, splashImageDimensions }: PostData) => {
  if (!slug || !source || !metadata) {
    return (
      <>
        <h2>Error fetching post</h2>
      </>
    );
  }

  const url = absoluteUrl(`/posts/${slug}`);
  const image = metadata.splashImageSource
    ? {
        url: absoluteUrl(metadata.splashImageSource),
        ...splashImageDimensions,
        alt: metadata.splashImageCaption || metadata.title,
      }
    : null;

  return (
    <>
      <PageLayout>
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
        <div className={styles.postContent}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw] as PluggableList}
            components={{
              // Code renders its own <pre>; react-markdown's would wrap a <div> in it.
              pre: ({ children }) => <>{children}</>,
              code: Code,
              img: Image,
            }}
          >
            {source}
          </ReactMarkdown>
        </div>
      </PageLayout>
    </>
  );
};

export default Post;

export const getStaticProps: GetStaticProps = async (context) => {
  const params = context.params as Params;

  if (!params) {
    return {
      props: {
        slug: undefined,
        source: undefined,
        metadata: undefined,
      },
    };
  }

  const source = getFileData(params.slug);

  if (!source) {
    return {
      props: {
        slug: undefined,
        source: undefined,
        metadata: undefined,
      },
    };
  }

  const { content, data } = matter(source);

  return {
    props: {
      slug: params.slug,
      source: content,
      metadata: {
        ...data,
        date: data.date.toISOString(),
        updated: data.updated ? data.updated.toISOString() : null,
      },
      splashImageDimensions: data.splashImageSource
        ? getImageDimensions(data.splashImageSource)
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
