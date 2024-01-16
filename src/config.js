import path from "path";

// Defines the default config and handles possibly loading it from a file

let config = {
  outputDir: "./blocks",
  inputDir: "./template-parts/blocks",
};

// Try to load from .blocktoolrc.json
export async function loadConfig() {
  const file = Bun.file(path.resolve(process.cwd(), ".blocktoolrc.json"));
  const exists = await file.exists();
  if (!exists) return; // No config :(

  const configFile = await file.json();
  config = {
    ...config,
    ...configFile,
  };
}

export function getConfig() {
  return config;
}
