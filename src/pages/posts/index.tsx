import PageLayout from "@/components/PageLayout";
import PostEntry from "@/components/PostEntry";
import PostPreviewPanel from "@/components/PostPreviewPanel";
import { getListedPosts } from "@/lib/api";
import { NextSeo } from "next-seo";
import { PostListItem } from "@/types";
import { usePostPreview } from "@/hooks/usePostPreview";
import styles from "@/styles/PostList.module.css";

const Posts = ({ posts }: { posts: PostListItem[] }) => {
  // Client state at the page level, matching the precedent in
  // src/pages/projects/index.tsx. getStaticProps below is untouched - the page
  // is still SSG and no new data enters __NEXT_DATA__.
  const { getRowProps, getPanelProps } = usePostPreview();

  return (
    <>
      <PageLayout>
        <NextSeo title="posts | angeni bai" description="posts by angeni" />
        <div className="pageHeader">
          <h1 className="pageheading">posts</h1>
          <p className="subheading">some thoughts were thought</p>
        </div>
        <div className={styles.postList}>
          {posts.map(
            (post) =>
              post.slug && (
                <div
                  className={styles.row}
                  key={post.slug}
                  {...getRowProps(post.slug)}
                >
                  <PostEntry post={post} />
                  <PostPreviewPanel post={post} {...getPanelProps(post.slug)} />
                </div>
              ),
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default Posts;

export const getStaticProps = async () => {
  const listedPosts = await getListedPosts();

  const posts: PostListItem[] = listedPosts
    // The list renders titles, dates and blurbs only - dropping `source` keeps
    // every post's full markdown out of the page's __NEXT_DATA__.
    .map(({ source, ...rest }) => rest)
    .sort((a, b) => {
      const aPinned = a.metadata?.pin ? 1 : 0;
      const bPinned = b.metadata?.pin ? 1 : 0;
      if (aPinned !== bPinned) {
        return bPinned - aPinned;
      }
      return (
        new Date(b.metadata!.date).getTime() -
        new Date(a.metadata!.date).getTime()
      );
    });

  return {
    props: {
      posts,
    },
  };
};
