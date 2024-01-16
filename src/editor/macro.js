import { writeFile, readFile, unlink } from "fs/promises";

const WORKFILE_NAME = "./.temp_workfile";

export async function setRunning(name) {
  await writeFile(WORKFILE_NAME, name);
}

export async function clearRunning() {
  await unlink(WORKFILE_NAME);
}

export async function getBlock() {
  try {
    const blockName = await readFile(WORKFILE_NAME, "utf8");
    return blockName;
  } catch (e) {
    throw new Error("Could not access workfile");
  }
}
