import PageLayout from "@/components/PageLayout";
import PostEntry from "@/components/PostEntry";
import { getAllPosts } from "@/lib/api";
import { NextSeo } from "next-seo";
import { PostData } from "@/types";

interface IndexedPostData extends PostData {
  listIndex: number;
}

const Posts = ({ posts }: { posts: IndexedPostData[] }) => {
  return (
    <>
      <PageLayout>
        <NextSeo title="posts | angeni bai" description="posts by angeni" />
        <div className="pageHeader">
          <h1 className="pageheading">posts</h1>
          <p className="subheading">some thoughts were thought</p>
        </div>
        <div>
          {posts.map(
            (post) =>
              post.slug && (
                <PostEntry post={post} index={post.listIndex} key={post.slug} />
              )
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default Posts;

export const getStaticProps = async () => {
  const allPosts = await getAllPosts();

  const listedPosts = allPosts.filter(
    (post) => post.metadata?.listed !== false
  );

  // Ascending by date so No. 01 is the oldest post, and index stays stable
  // as new posts are added on top.
  const byAscendingDate = [...listedPosts].sort(
    (a, b) =>
      new Date(a.metadata!.date).getTime() -
      new Date(b.metadata!.date).getTime()
  );

  const listIndexBySlug = new Map(
    byAscendingDate.map((post, i) => [post.slug, i + 1])
  );

  const posts: IndexedPostData[] = listedPosts
    .map((post) => ({
      ...post,
      listIndex: listIndexBySlug.get(post.slug)!,
    }))
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
