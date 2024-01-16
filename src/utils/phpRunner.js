import childProcess from "node:child_process";
import path from "node:path";

export function executePHPFile(filePath) {
  const toolRoot = path.resolve(import.meta.dir, "../../");

  return new Promise((resolve, reject) => {
    const cp = childProcess.exec(
      `php ${path.resolve(toolRoot, "./php/runner.php")} ${filePath}`
    );
    let output = "";

    cp.stdout.on("data", (data) => {
      output += data.toString();
    });

    cp.stderr.on("data", (data) => {
      reject(new Error(`Could not parse PHP response: ${data}`));
    });

    cp.on("close", () => {
      resolve(output);
    });
  });
}
