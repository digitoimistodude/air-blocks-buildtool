import path from "node:path";
import { mkdir } from "node:fs/promises";
import { getConfig } from "../config.js";
import { readdir } from "fs/promises";
import { clearRunning, setRunning } from "../editor/macro.js";
import { generateBlockJson } from "../builders/php.js";

export default async function () {
  const config = getConfig();
  const inputDir = path.resolve(process.cwd(), config.inputDir);
  const outputDirRoot = path.resolve(process.cwd(), config.outputDir);

  build(inputDir, outputDirRoot);
}

async function build(inputDir, outputDirRoot) {
  const config = getConfig();
  const files = await readdir(inputDir);

  // For now only care for php files
  const blockFiles = files.filter((i) => i.endsWith(".block.php"));
  if (blockFiles.length === 0) {
    console.error(
      `[Air Blocks] Could not find any files meeting criteria: ${config.inputDir}/*.block.php`
    );
    return;
  }

  for (const file of blockFiles) {
    const inputFile = path.resolve(inputDir, file);
    const toolRoot = path.resolve(import.meta.dir, "../../");
    const outputDir = path.resolve(
      outputDirRoot,
      file.substring(0, file.length - ".block.php".length)
    ); // test.php -> blocks/test/block.json

    const blockJson = await generateBlockJson(inputFile);
    setRunning(blockJson.name); // Set block name to render to editor script

    const buildResult = await Bun.build({
      entrypoints: [path.resolve(toolRoot, "./src/editor/index.js")],
      minify: true,
      target: "browser",
    });

    if (!buildResult.success) {
      console.error("[Air Blocks] Building editor script files failed!");
      console.debug(buildResult);
      process.exit();
    }

    await mkdir(outputDir, { recursive: true });
    await Bun.write(path.join(outputDir, "editor.js"), buildResult.outputs[0]);
    await Bun.write(
      path.join(outputDir, "block.json"),
      JSON.stringify(blockJson, null, 2)
    );
    await Bun.write(
      path.join(outputDir, "editor.asset.php"),
      `<?php return array( 'dependencies' => array( 'react', 'wp-blocks', 'wp-i18n', 'wp-block-editor' ), 'version' => '${Bun.hash(
        Date.now()
      )}' );`
    );
    await Bun.write(
      path.join(outputDir, "block.php"),
      await Bun.file(inputFile).text()
    );
    await Bun.write(
      path.join(outputDir, "render.php"),
      await Bun.file(path.resolve(toolRoot, "./php/framework.php")).text()
    );

    clearRunning();

    console.log(
      `[Air Blocks] Block built: ${blockJson.title ?? "Unknown"} (${file})`
    );
  }
}
