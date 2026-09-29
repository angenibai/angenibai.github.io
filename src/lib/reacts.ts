import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

// Firebase web config is public. Access control is in firestore.rules.
const firebaseConfig = {
  apiKey: "AIzaSyC_2RDdxV3ShObX1G8FpOiuIOLpHwtwRGw",
  authDomain: "blog-reacts.firebaseapp.com",
  projectId: "blog-reacts",
  appId: "1:186133183760:web:5880ff7839a80d42557995",
};

// Fast Refresh re-runs this module, so reuse the app if it already exists.
export const getReactsDb = () =>
  getFirestore(getApps().length ? getApp() : initializeApp(firebaseConfig));
