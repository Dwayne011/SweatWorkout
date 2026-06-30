// Builds a single self-contained Markdown digest of the committed source —
// for uploading to a Claude Project (or any LLM) as up-to-date code context.
//
// Run: npm run digest  ->  writes project-pb-digest.md
//
// Uses `git ls-files`, so it only ever includes COMMITTED, non-gitignored files:
// no node_modules, no dist, no .env / secrets, no scratch images. Re-run it after
// changes and re-upload to refresh.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT = "project-pb-digest.md";

const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".css", ".html", ".md", ".rules", ".gradle"]);
const LANG = { tsx: "tsx", ts: "ts", js: "js", mjs: "js", cjs: "js", json: "json", css: "css", html: "html", md: "markdown", rules: "", gradle: "groovy" };

// Skip the native Android project, the lockfile and other low-signal noise — the
// digest is for understanding the app (web + backend + data + native auth glue).
const skip = (f) =>
  f.startsWith("android/") ||
  f === "package-lock.json" ||
  f.startsWith("public/") && !f.endsWith(".json");

const files = execSync("git ls-files", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((f) => TEXT_EXT.has(path.extname(f)) && !skip(f))
  .sort();

let body = "";
let bytes = 0;
for (const f of files) {
  let content;
  try { content = readFileSync(f, "utf8"); } catch { continue; }
  bytes += Buffer.byteLength(content);
  const lang = LANG[path.extname(f).slice(1)] ?? "";
  // 5-backtick outer fence so any ``` / ```` inside the file can't break it.
  body += `\n\n## \`${f}\`\n\n\`\`\`\`\`${lang}\n${content}\n\`\`\`\`\`\n`;
}

const head = `# Project PB — codebase digest

Point-in-time snapshot of the committed source, generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC.
${files.length} files · ~${Math.round(bytes / 1024)} KB. No node_modules, no build output, no secrets
(the Gemini key lives only in a gitignored .env / the Cloud Run secret).

To refresh after changes: \`npm run digest\` and re-upload this file.

React 19 + TypeScript + Vite + Tailwind v4 + Motion(Framer) PWA, wrapped as a
Capacitor 8 Android app. Express backend (server.ts) proxies Gemini (server-side
key) and serves the web app. Navigation is an \`activeTab\` state union in App.tsx
(no router). Excludes the native android/ project and binary assets.

## Files
${files.map((f) => `- ${f}`).join("\n")}
`;

writeFileSync(OUT, head + body);
console.log(`Wrote ${OUT} — ${files.length} files, ${Math.round(bytes / 1024)} KB`);
