import PageLayout from "@/components/PageLayout";
import { getAllPosts } from "@/lib/api";
import { NextSeo } from "next-seo";
import Link from "next/link";
import styles from "@/styles/Post.module.css";
import { Post } from "@/types";

const Posts = ({ posts }: { posts: Post[] }) => {
  return (
    <>
      <PageLayout>
        <NextSeo title="posts | angeni bai" description="posts by angeni" />
        <div className="pageHeader">
          <h1 className="pageheading">posts</h1>
          <p className="subheading">some thoughts were thought</p>
        </div>
        <div className={styles.postsContainer}>
          {posts.map(
            (post) =>
              post.slug && (
                <div className={styles.postTile} key={post.slug}>
                  <Link href={`/posts/${post.slug}`}>
                    <h2>{post.metadata?.title}</h2>
                  </Link>
                </div>
              )
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default Posts;

export const getStaticProps = async () => {
  const posts = await getAllPosts();

  return {
    props: {
      posts,
    },
  };
};
