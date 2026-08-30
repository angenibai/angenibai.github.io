import fs from "fs";
import path from "path";
import YAML from "yaml";

import matter from "gray-matter";

import { PostMetadata } from "@/types";

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

const EXCERPT_LENGTH = 100;

// Post bodies don't start with clean prose, and rehype-raw means raw HTML is
// legal anywhere in them - so strip the markup before truncating, otherwise the
// slice can land inside a tag or a link target.
const toExcerpt = (markdown: string) => {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= EXCERPT_LENGTH) {
    return plain;
  }

  const sliced = plain.slice(0, EXCERPT_LENGTH);
  const lastSpace = sliced.lastIndexOf(" ");

  return `${(lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}\u2026`;
};

export const getPostBySlug = async (slug: string) => {
  const source = fs.readFileSync(path.join(postsDirectory, `${slug}.md`));
  const { content, data } = matter(source);

  return {
    slug,
    source: content,
    excerpt: toExcerpt(content),
    metadata: {
      ...data,
      date: data.date.toISOString(),
    } as PostMetadata,
  };
};

export const getFileData = (slug: string) => {
  const data = fs.readFileSync(path.join(postsDirectory, `${slug}.md`), {
    encoding: "utf-8",
  });
  return data ? data : null;
};

export const getPaths = () => {
  const filenames = fs.readdirSync(postsDirectory);
  return filenames.map((filename) => {
    return {
      params: {
        slug: filename.replace(/\.md$/, ""),
      },
    };
  });
};

export const getAllPosts = async () => {
  const filenames = fs.readdirSync(postsDirectory);
  const allPostsData = await Promise.all(
    filenames.map(async (filename) => {
      const slug = filename.replace(/\.md$/, "");

      const postData = await getPostBySlug(slug);

      return postData;
    })
  );
  return allPostsData;
};
