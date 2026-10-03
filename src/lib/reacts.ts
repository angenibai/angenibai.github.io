export const REACTS = [
  { key: "like", emoji: "👍", label: "Like" },
  { key: "laugh", emoji: "😆", label: "Laugh" },
  { key: "love", emoji: "😍", label: "Love" },
  { key: "surprised", emoji: "😮", label: "Surprised" },
  { key: "angry", emoji: "😤", label: "Angry" },
  { key: "sad", emoji: "😥", label: "Sad" },
] as const;
export type ReactKey = (typeof REACTS)[number]["key"];

// Doc IDs were slugified Jekyll paths (/2023/04/08/foo.html →
// 2023-04-08-foo-html). Keep the suffix so existing counts carry over.
// scripts/reacts-init.mjs duplicates this.
export const reactsDocId = (slug: string) => `${slug}-html`;
