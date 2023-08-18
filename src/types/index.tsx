import { ReactNode } from "react";

export interface ProjectContent {
  name: string;
  imgSrc?: string;
  shortDescription?: string;
  longDescription?: string;
  tags?: string[];
  actionButtons?: string;
  repoLink?: string;
  demoLink?: string;
  blogLink?: string;
}
