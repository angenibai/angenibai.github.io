import PageLayout from "@/components/PageLayout";
import { getFileData, getPaths } from "@/lib/api";
import { Post } from "@/types";
import { GetStaticProps, GetStaticPropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import matter from "gray-matter";
import {
  PluggableList,
  ReactMarkdown,
} from "react-markdown/lib/react-markdown";
import styles from "@/styles/Post.module.css";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface Params extends ParsedUrlQuery {
  slug: string;
}

const Post = ({ slug, source, metadata }: Post) => {
  if (!slug || !source || !metadata) {
    return (
      <>
        <h2>Error fetching post</h2>
      </>
    );
  }

  return (
    <>
      <PageLayout>
        <h2>{metadata.title}</h2>
        <div className={styles.postContent}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw] as PluggableList}
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
      },
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
