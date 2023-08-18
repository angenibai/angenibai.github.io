import { NextSeo } from "next-seo";

const Posts = () => {
  return (
    <>
      <NextSeo title="posts | angeni bai" description="posts by angeni" />
      <div className="pageHeader">
        <h1 className="pageheading">posts</h1>
        <p className="subheading">some thoughts were thought</p>
      </div>
    </>
  );
};

export default Posts;
