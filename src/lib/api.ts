import fs from "fs";
import path from "path";
import YAML from "yaml";

import matter from "gray-matter";

const projectsFile = path.join(process.cwd(), "_data/projects.yaml");
const bioFile = path.join(process.cwd(), "_data/bio.yaml");
export const postsDirectory = path.join(process.cwd(), "_data/posts");

const getYAML = (filepath: string) => {
  const fileContents = fs.readFileSync(filepath, "utf8");

  return YAML.parse(fileContents);
};

export const getAllProjects = () => {
  return getYAML(projectsFile);
};

export const getBio = () => {
  return getYAML(bioFile);
};

export const getPostBySlug = async (slug: string) => {
  const source = fs.readFileSync(path.join(postsDirectory, `${slug}.mdx`));
  const { content, data } = matter(source);

  return {
    slug,
    source: content,
    metadata: {
      ...data,
      date: data.date.toISOString(),
    },
  };
};

export const getFileData = (slug: string) => {
  const data = fs.readFileSync(path.join(postsDirectory, `${slug}.mdx`), {
    encoding: "utf-8",
  });
  return data ? data : null;
};

export const getPaths = () => {
  const filenames = fs.readdirSync(postsDirectory);
  return filenames.map((filename) => {
    return {
      params: {
        slug: filename.replace(/\.mdx$/, ""),
      },
    };
  });
};

export const getAllPosts = async () => {
  const filenames = fs.readdirSync(postsDirectory);
  const allPostsData = await Promise.all(
    filenames.map(async (filename) => {
      const slug = filename.replace(/\.mdx$/, "");

      const postData = await getPostBySlug(slug);

      return postData;
    })
  );
  return allPostsData;
};
