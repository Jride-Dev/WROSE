// check-safety.mjs
// Scans WROSE Sentinel source files for destructive Reddit API patterns.
// Conservative scanner: flags potential violations but allows docs/comments.
// Fails with exit code 1 if destructive implementation patterns are found.

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "src");

const DESTRUCTIVE_TERMS = [
  "remove",
  "lock",
  "ban",
  "mute",
  "report",
  "approve",
  "distinguish",
  "delete",
];

// Subreddit API method patterns that indicate destructive usage
const DESTRUCTIVE_API_PATTERNS = [
  /\.remove\(/,
  /\.lock\(/,
  /\.ban\(/,
  /\.mute\(/,
  /\.report\(/,
  /\.approve\(/,
  /\.distinguish\(/,
  /\.delete\(/,
  /reddit\.modTools/,
  /reddit\.modNote/,
];

function walkFiles(dir) {
  if (!existsSync(dir)) return [];

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...walkFiles(fullPath));
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        files.push(fullPath);
      }
    }
    return files;
  } catch {
    return [];
  }
}

const files = walkFiles(ROOT);
let violations = [];
let totalViolations = 0;

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check for destructive API calls
    for (const pattern of DESTRUCTIVE_API_PATTERNS) {
      if (pattern.test(line)) {
        violations.push({
          file,
          line: lineNum,
          text: line.trim(),
          pattern: pattern.toString(),
          type: "destructive_api_call",
        });
      }
    }

    // Check for imports of destructive Reddit API methods
    for (const term of DESTRUCTIVE_TERMS) {
      if (
        line.includes(`"${term}"`) &&
        (line.includes("import") || line.includes("require"))
      ) {
        violations.push({
          file,
          line: lineNum,
          text: line.trim(),
          term,
          type: "destructive_import",
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.log("WROSE Sentinel Safety Check — VIOLATIONS FOUND\n");
  for (const v of violations) {
    const relPath = join("src", v.file.replace(ROOT, "").replace(/^[/\\]/, ""));
    console.log(`  ${v.type}: ${relPath}:${v.line}`);
    console.log(`    ${v.text}`);
    console.log();
  }
  console.log(`Found ${violations.length} potential safety violation(s).`);
  console.log();
  console.log(
    "NOTE: This scanner may produce false positives for comments/documentation.",
  );
  console.log(
    "Manual review is required to confirm whether each finding is a true violation.",
  );
  process.exit(1);
} else {
  console.log("WROSE Sentinel Safety Check — PASSED");
  console.log(`Scanned ${files.length} file(s) in src/`);
  console.log("No destructive API patterns found.");
  process.exit(0);
}
