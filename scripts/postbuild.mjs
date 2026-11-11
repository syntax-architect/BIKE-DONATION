import fs from "fs";
import path from "path";

const standaloneDir = path.resolve(".next", "standalone");
if (!fs.existsSync(standaloneDir)) {
  console.log("[postbuild] No .next/standalone folder found, skipping.");
  process.exit(0);
}

// 1. Copy static assets & public directory into .next/standalone
const staticSrc = path.resolve(".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");
if (fs.existsSync(staticSrc)) {
  fs.cpSync(staticSrc, staticDest, { recursive: true });
  console.log("[postbuild] Copied .next/static");
}

const publicSrc = path.resolve("public");
const publicDest = path.join(standaloneDir, "public");
if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true });
  console.log("[postbuild] Copied public/");
}

// 2. Patch standalone server.js so Render/PaaS HOSTNAME env var doesn't block 0.0.0.0 binding
const serverFile = path.join(standaloneDir, "server.js");
if (fs.existsSync(serverFile)) {
  const src = fs.readFileSync(serverFile, "utf8");
  const patched = src.replace(
    "const hostname = process.env.HOSTNAME || '0.0.0.0'",
    "const hostname = process.env.BIND_HOST || '0.0.0.0'",
  );
  if (patched !== src) {
    fs.writeFileSync(serverFile, patched, "utf8");
    console.log("[postbuild] Patched .next/standalone/server.js to bind 0.0.0.0 by default");
  }
}
