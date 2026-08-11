import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

// Pin Turbopack to this project. A parent package-lock.json under the user
// home directory otherwise becomes the inferred workspace root and breaks
// route module loading ("ComponentMod.handler is not a function").
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
