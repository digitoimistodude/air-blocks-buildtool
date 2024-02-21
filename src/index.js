import { program } from "commander";
import build from "./commands/build.js";
import dev from "./commands/dev.js";
import { loadConfig } from "./config.js";

if (!global.Bun) {
  console.error(
    "Currently this version uses Bun instead of Node.js, as it has better performance, built-in JS bundler, support for both CommonJS and module imports, and more!"
  );
  console.log("Read more: https://bun.sh");
  process.exit();
}

await loadConfig();

// Initialize the application information
program
  .name("Air Blocks Build Tool")
  .description("Generates native Gutenberg blocks from PHP")
  .version("0.0.1");

// Add the build command
program
  .command("build")
  .description("Builds the available blocks to block.json format")
  .action(build);

// Add the dev command (watch)
program
  .command("dev")
  .alias("watch")
  .description(
    "Builds the available blocks to block.json format in watch mode (not implemented)"
  )
  .action(dev);

// Runs the program
program.parse();
