import PageLayout from "@/components/PageLayout";
import PostEntry from "@/components/PostEntry";
import PostPreviewPanel from "@/components/PostPreviewPanel";
import { getListedPosts } from "@/lib/api";
import { absoluteUrl } from "@/lib/site";
import { NextSeo } from "next-seo";
import { PostListItem } from "@/types";
import { usePostPreview } from "@/hooks/usePostPreview";
import styles from "@/styles/PostList.module.css";

interface YearGroup {
  year: string;
  posts: PostListItem[];
}

interface PostsProps {
  pinned: PostListItem[];
  years: YearGroup[];
}

// Posts arrive sorted newest first, so each new year starts a new group. The
// year comes from the ISO string because the stored date is UTC midnight, and
// a local-time year would move a 1 January post back west of UTC.
const groupByYear = (posts: PostListItem[]): YearGroup[] =>
  posts.reduce<YearGroup[]>((groups, post) => {
    const year = post.metadata!.date.slice(0, 4);
    const last = groups[groups.length - 1];
    if (last?.year === year) {
      last.posts.push(post);
    } else {
      groups.push({ year, posts: [post] });
    }
    return groups;
  }, []);

const Posts = ({ pinned, years }: PostsProps) => {
  // Client state at the page level, matching the precedent in
  // src/pages/projects/index.tsx. getStaticProps below is untouched - the page
  // is still SSG and no new data enters __NEXT_DATA__.
  const { getRowProps, getPanelProps } = usePostPreview();

  const renderRow = (post: PostListItem) =>
    post.slug && (
      <div className={styles.row} key={post.slug} {...getRowProps(post.slug)}>
        <PostEntry post={post} />
        <PostPreviewPanel post={post} {...getPanelProps(post.slug)} />
      </div>
    );

  return (
    <>
      <PageLayout>
        <NextSeo
          title="posts | angeni bai"
          description="posts by angeni"
          canonical={absoluteUrl("/posts")}
          openGraph={{ url: absoluteUrl("/posts") }}
        />
        <div className="pageHeader">
          <h1 className="pageheading">posts</h1>
          <p className="subheading">some thoughts were thought</p>
        </div>
        <div className={styles.postList}>
          {pinned.length > 0 && (
            <section className={styles.group} aria-labelledby="posts-pinned">
              <h2 id="posts-pinned" className="visually-hidden">
                pinned
              </h2>
              <div className={styles.entries}>{pinned.map(renderRow)}</div>
            </section>
          )}
          {years.map(({ year, posts }) => (
            <section
              className={styles.group}
              key={year}
              aria-labelledby={`posts-${year}`}
            >
              <h2 id={`posts-${year}`} className={styles.year}>
                {year}
              </h2>
              <div className={styles.entries}>{posts.map(renderRow)}</div>
            </section>
          ))}
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
    .sort(
      (a, b) =>
        new Date(b.metadata!.date).getTime() -
        new Date(a.metadata!.date).getTime(),
    );

  const pinned = posts.filter((post) => post.metadata?.pin);
  const years = groupByYear(posts.filter((post) => !post.metadata?.pin));

  return {
    props: {
      pinned,
      years,
    },
  };
};
