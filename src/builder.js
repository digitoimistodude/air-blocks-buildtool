import { generateBlockJson } from "./builders/php.js";

export async function buildTemplate(templatePath, fileType = "php") {
  const blockJson = await generateBlockJson(templatePath);
  return { blockJson };
}
