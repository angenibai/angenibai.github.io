import fs from "fs";
import path from "path";
import YAML from "yaml";
import { imageSize } from "image-size";

import matter from "gray-matter";

import { BioContent, PostMetadata } from "@/types";

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

export const getBio = (): BioContent => {
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
      updated: data.updated ? data.updated.toISOString() : null,
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

// Reads intrinsic pixel dimensions for a root-relative /img/... path, so
// next/image can be given real width/height instead of a guessed one. Only
// handles local files under public/ - returns null (rather than throwing)
// for anything else, or if the file is missing, so a bad path degrades to
// a plain <img> instead of failing the build.
export const getImageDimensions = (srcPath: string) => {
  if (!srcPath.startsWith("/")) {
    return null;
  }

  try {
    const file = fs.readFileSync(path.join(process.cwd(), "public", srcPath));
    const { width, height } = imageSize(file);

    return width && height ? { width, height } : null;
  } catch {
    return null;
  }
};

export const getAllPosts = async () => {
  const filenames = fs.readdirSync(postsDirectory);
  const allPostsData = await Promise.all(
    filenames.map(async (filename) => {
      const slug = filename.replace(/\.md$/, "");

      const postData = await getPostBySlug(slug);

      return postData;
    }),
  );
  return allPostsData;
};

// `listed: false` hides a post from the posts page and the sitemap, but it
// still builds and is reachable by URL.
export const getListedPosts = async () =>
  (await getAllPosts()).filter((post) => post.metadata.listed !== false);
