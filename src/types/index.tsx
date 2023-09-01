export interface ProjectContent {
  name: string;
  imgSrc?: string;
  shortDescription?: string;
  longDescription?: string;
  tags?: string[];
  actionButtons?: string;
  repoLink?: string;
  siteLink?: string;
  blogLink?: string;
}

export interface PostMetadata {
  layout: string;
  title: string;
  date: string;
  tags?: string[];
  splashImageSource?: string;
  splashImageCaption?: string;
  updated?: string;
  author?: { name: string; email: string };
  pin?: boolean;
  listed?: boolean;
  index?: boolean;
}

export interface Post {
  slug: string | undefined;
  source: any | undefined;
  metadata: PostMetadata | undefined;
}
