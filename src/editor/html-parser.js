import { ProcessNodeDefinitions, Parser } from "@raikasta/html-to-react";
const { InnerBlocks, RichText } = window.wp.blockEditor;
const { __ } = window.wp.i18n;

const htmlToReactParser = new Parser();
const richTextTags = ["p", "span", "a", "h1", "h2", "h3", "h4", "h5", "h6"];

/**
 * Turns HTML into React element, with all necessary rich stuff
 * Makes x-rich text blocks work
 *
 * @param {string} htmlInput The HTML in string form (from WP API)
 */
export default function bringHtmlToLife(
  htmlInput,
  attributes = {},
  setAttributes = () => undefined
) {
  const processNodeDefinitions = new ProcessNodeDefinitions();
  const processingInstructions = [
    {
      // Custom <h1> processing
      shouldProcessNode: (node) =>
        richTextTags.includes(node.name) &&
        Object.keys(node.attribs).includes("wp-rich"),
      processNode: (node, children) => {
        const attributeName = node.attribs["wp-rich"];
        const formats =
          node.attribs["wp-rich-formats"]
            ?.split(",")
            .map((format) =>
              format.includes("/") ? format : `core/${format}`
            ) ?? [];

        const { ["class"]: discard, ...customAttribs } = node.attribs;

        return (
          <RichText
            {...customAttribs}
            className={node.attribs.class}
            tagName={node.name} // The tag here is the element output and editable in the admin
            value={attributes[attributeName] ?? ""} // Any existing content, either from the database or an attribute default
            allowedFormats={formats} // Allow the content to be made bold or italic, but do not allow other formatting options
            onChange={(content) => {
              console.log("Setting " + attributeName + " to value " + content);
              setAttributes({ [attributeName]: content });
            }} // Store updated content as a block attribute
            placeholder={
              node.attribs["wp-placeholder"] ?? __("Start writing...")
            } // Display this text before any content has been added by the user
          />
        );
      },
    },
    {
      // InnerBlocks
      shouldProcessNode: (node) => node.name?.toLowerCase() === "innerblocks",
      processNode: (node, children) => {
        const allowedBlocks =
          node.attribs["wp-allowed-blocks"]
            ?.split(",")
            .map((format) =>
              format.includes("/") ? format : `core/${format}`
            ) ?? true;
        return (
          <InnerBlocks
            allowedBlocks={allowedBlocks}
            template={
              node.attribs["wp-template"]
                ? JSON.parse(node.attribs["wp-template"])
                : undefined
            }
            templateLock={
              node.attribs["wp-template-lock"]
                ? node.attribs["wp-template-lock"] === "false"
                  ? false
                  : node.attribs["wp-template-lock"]
                : undefined
            }
            templateInsertUpdatesSelection={
              node.attribs["wp-template-insert-updates-selection"] === "true"
            }
            defaultBlock={
              node.attribs["wp-default-block"]
                ? JSON.parse(node.attribs["wp-default-block"])
                : undefined
            }
            directInsert={node.attribs["wp-direct-insert"] === "true"}
          />
        );
      },
    },
    {
      // Anything else
      shouldProcessNode: function (node) {
        return true;
      },
      processNode: processNodeDefinitions.processDefaultNode,
    },
  ];

  return htmlToReactParser.parseWithInstructions(
    htmlInput,
    () => true,
    processingInstructions
  );
}
