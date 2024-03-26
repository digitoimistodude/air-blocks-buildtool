import PHPParser from "php-parser";
import { parse as parseComments } from "comment-parser";
import { executePHPFile } from "../utils/phpRunner.js";
import path from "node:path";
import merge from "deepmerge";

const parser = new PHPParser({
  parser: {
    extractDoc: true,
    php7: true,
  },
});

export async function generateBlockJson(input) {
  const program = parser.parseCode(await Bun.file(input).text());

  // Get the title, description, etc from comment header
  const headerExpression = program.children[0].leadingComments[0];
  if (!headerExpression)
    throw new Error(`Couldn't register block due to header missing.`);

  const headerComments = parseComments(headerExpression.value);
  const lines = headerComments[0].source
    .filter((i) => i.tokens.description !== "")
    .map((i) => i.tokens.description)
    .map((i) => i.replace(/\s\s+/g, " ")) // Remove double spaces in between
    .map((i) => {
      const split = i.split(": ");
      const key = split.shift().toLowerCase().replaceAll(" ", "_");
      const value = split.join(" ");

      return {
        [key]: value,
      };
    });
  const headerData = Object.assign({}, ...lines);

  // Get attributes that need to be registered
  const attributeExpressions = program.children
    .map((i) => i.expression)
    .filter((i) => i?.kind === "call") // Check that it's a function call. Also filters undefineds
    .filter(
      (i) => i.what?.kind === "name" && i.what.name === "register_attribute"
    ); // Check that it's a attribute registration

  // TODO: process these attributes to proper block json format :)
  let attributes = attributeExpressions.map((expression) => {
    const [name, label, type, defaultValue] = expression.arguments.map(
      (i) => i.value
    );
    return {
      name,
      type,
      defaultValue,
      "air-type": "sidebar",
      "air-label": label,
    };
  });

  const richTextAttributes = await getRichTextAttributes(input);
  attributes = [...attributes, ...richTextAttributes];
  // TODO: temp fix, rewrite this later to the correct format (not array, key => obj)
  attributes = attributes.reduce((obj, item) => {
    const { name, ...data } = item;
    return Object.assign(obj, { [name]: data });
  }, {});

  let blockJson = {
    apiVersion: 3,
    ...headerData,
    editorScript: "file:./editor.js",
    render: "file:./render.php",
    attributes,
  };

  // Allow overriding block.json using <blockname>.block.json
  // BJOF = Block.Json Override File
  const bjofPath = path.format({
    ...path.parse(input),
    base: "",
    ext: "json",
  });
  const bjofFile = Bun.file(bjofPath);

  if (await bjofFile.exists()) {
    const blockJsonOverride = await bjofFile.json();

    if (blockJsonOverride.air_override_attributes) {
      attributes = blockJsonOverride.attributes;
      delete blockJsonOverride.air_override_attributes;
      delete blockJsonOverride.attributes;
    }

    blockJson = merge(blockJson, blockJsonOverride);
  }

  // Quickly make sure title is set
  if (!blockJson.title)
    throw new Error(`Couldn't register block due to title missing.`);

  // Use airblocks namespace if namespace isn't set
  if (!blockJson.name) {
    const id = blockJson.title
      .toLowerCase()
      .replace(" ", "-")
      .replace(/\W/g, "");
    blockJson.name = `airblocks/${id}`;
  }

  return blockJson;
}

async function getRichTextAttributes(blockPath) {
  const html = (await executePHPFile(blockPath)).trim();
  let blockJsonAttributes = [];
  const transformer = new HTMLRewriter().on("*[wp-rich]", {
    element(el) {
      const attributes = Object.fromEntries(Array.from(el.attributes));
      blockJsonAttributes.push({
        name: attributes["wp-rich"],
        type: "string",
        default: attributes["wp-default"] ?? "",
        "air-label": attributes["wp-rich"],
        "air-type": "rich-text",
      });
    },
  });

  await transformer.transform(html);

  return blockJsonAttributes;
}
