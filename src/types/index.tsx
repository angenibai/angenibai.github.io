export interface ProjectContent {
  name: string;
  imgSrc?: string;
  shortDescription?: string;
  longDescription?: string;
  tags?: string[];
  actionButtons?: string;
  repoLink?: string;
  repoLinkText?: string;
  siteLink?: string;
  siteLinkText?: string;
  blogLink?: string;
  blogLinkText?: string;
  links?: Link[];
}

export interface Link {
  label: string;
  url: string;
  text: string;
}

export interface PostMetadata {
  layout: string;
  title: string;
  date: string;
  tags?: string[];
  splashImageSource?: string;
  splashImageCaption?: string;
  updated?: string | null;
  author?: { name: string; homepage: string };
  pin?: boolean;
  listed?: boolean;
  index?: boolean;
  reacts?: boolean;
  blurb?: string;
  coauthors?: string[];
  externalLink?: string;
}

export interface PostData {
  slug: string | undefined;
  source: any | undefined;
  excerpt?: string;
  metadata: PostMetadata | undefined;
  splashImageDimensions?: { width: number; height: number } | null;
}

// The list page never renders post bodies, and shipping them would put every
// post's full markdown into __NEXT_DATA__.
export type PostListItem = Omit<PostData, "source">;

export interface BioEntry {
  label: string;
  // Raw HTML string.
  value: string;
}

export interface BioSection {
  title: string | null;
  entries: BioEntry[];
}

export interface BioContent {
  heading: string;
  img: string | null;
  sections: BioSection[];
}

// One entry in _data/redirects.yaml. The destination key decides how the
// redirect page is rendered.
export type Redirect =
  | { from: string; post: string }
  | { from: string; page: string }
  | { from: string; link: string };
