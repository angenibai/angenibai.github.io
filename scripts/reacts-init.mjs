// Create the Firestore reacts doc for each native post that doesn't have one,
// so its react bar shows up. Requires gcloud logged in as a blog-reacts owner.
//
// Usage: node scripts/reacts-init.mjs [--dry-run]
//   --dry-run   List the doc IDs it would try to create without writing
//
// Existing docs are never overwritten, so re-running this is safe. Owner
// credentials bypass firestore.rules, which is why this can create docs when
// visitors can't.

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import matter from "gray-matter";

const PROJECT = "blog-reacts";
const FIELDS = ["total", "like", "laugh", "love", "surprised", "angry", "sad"];
const postsDirectory = path.join(process.cwd(), "_data/posts");
const dryRun = process.argv.includes("--dry-run");

// Duplicates reactsDocId in src/lib/reacts.ts.
const reactsDocId = (slug) => `${slug}-html`;

const docIds = fs
  .readdirSync(postsDirectory)
  .filter((file) => file.endsWith(".md"))
  .filter((file) => {
    const { data } = matter(
      fs.readFileSync(path.join(postsDirectory, file), "utf8"),
    );
    return !data.externalLink && data.reacts !== false;
  })
  .map((file) => reactsDocId(file.replace(/\.md$/, "")));

if (dryRun) {
  docIds.forEach((id) => console.log(`would create ${id} (if missing)`));
  process.exit(0);
}

let token;
try {
  token = execSync("gcloud auth print-access-token", {
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim();
} catch {
  console.error(
    `error: no gcloud credentials. Run \`gcloud auth login\` with the ${PROJECT} owner account.`,
  );
  process.exit(1);
}

const fields = Object.fromEntries(
  FIELDS.map((field) => [field, { integerValue: "0" }]),
);

for (const id of docIds) {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/reacts?documentId=${id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-goog-user-project": PROJECT,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    },
  );
  if (res.ok) {
    console.log(`created ${id}`);
  } else if (res.status === 409) {
    console.log(`exists  ${id}`);
  } else {
    console.error(`error: ${res.status} creating ${id}\n${await res.text()}`);
    process.exit(1);
  }
}
