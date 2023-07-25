import { ReactNode } from "react";

export interface ProjectContent {
  name: string;
  shortDescription?: ReactNode;
  longDescription?: ReactNode;
  tags?: string[];
  repoLink?: string;
  demoLink?: string;
  blogLink?: string;
}
