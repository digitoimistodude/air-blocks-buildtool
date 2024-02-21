import path from "node:path";
import { getConfig } from "../config.js";
import { watch } from "fs/promises";
import build from "./build.js";

export default async function () {
  const config = getConfig();
  const inputDir = path.resolve(process.cwd(), config.inputDir);
  const outputDirRoot = path.resolve(process.cwd(), config.outputDir);

  await build(inputDir, outputDirRoot);
  console.log("[Air Blocks] Watching for changes...");
  const watcher = watch(inputDir, { recursive: true });

  for await (const { eventType, filename } of watcher) {
    console.log(
      `[Air Blocks] Detected changes, rebuilding blocks... (${eventType} in ${filename})`
    );
    await build(inputDir, outputDirRoot);
  }
}
