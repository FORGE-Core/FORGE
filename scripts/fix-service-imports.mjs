import fs from "fs";
import path from "path";

const reps = [
  ["@/services/errors", "@/services/server/errors"],
  ["@/services/types", "@/services/server/types"],
  ["@/services/shared/", "@/services/server/shared/"],
  ["@/services/training/", "@/services/server/training/"],
  ["@/services/documents/", "@/services/server/documents/"],
  ["@/services/ai/", "@/services/server/ai/"],
  ["@/services/chat/", "@/services/server/chat/"],
  ["@/services/reports/", "@/services/server/reports/"],
  ["@/services/dashboard/", "@/services/server/dashboard/"],
  ["@/services/profile/", "@/services/server/profile/"],
  ['from "@/services/documents"', 'from "@/services/server/documents"'],
  ['from "@/services/chat"', 'from "@/services/server/chat"'],
  ['from "@/services/training"', 'from "@/services/server/training"'],
  ['from "@/services/users"', 'from "@/services/server/users"'],
  ['from "@/services/organization"', 'from "@/services/server/organization"'],
  ['from "@/services/dashboard"', 'from "@/services/server/dashboard"'],
  ['from "@/services/profile"', 'from "@/services/server/profile"'],
  ['from "@/services/reports"', 'from "@/services/server/reports"'],
  ['from "@/services/processes"', 'from "@/services/server/processes"'],
  ['from "@/services/alae"', 'from "@/services/server/alae"'],
];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p);
    else if (/\.(ts|tsx|md)$/.test(name)) {
      let content = fs.readFileSync(p, "utf8");
      const original = content;
      for (const [from, to] of reps) {
        content = content.split(from).join(to);
      }
      if (content !== original) fs.writeFileSync(p, content);
    }
  }
}

walk("src");
