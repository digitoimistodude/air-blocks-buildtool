import { ProcessNodeDefinitions, Parser } from "@raikasta/html-to-react";
const { InnerBlocks, RichText } = window.wp.blockEditor;
const { __ } = window.wp.i18n;

const { InspectorControls } = window.wp.blockEditor;
const { PanelBody } = window.wp.components;

const htmlToReactParser = new Parser();
const richTextTags = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];

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

        return (
          <RichText
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
            ) ?? undefined;
        return <InnerBlocks allowedBlocks={allowedBlocks} />;
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

function findAcfParent(node, index = 0) {
  if (node?.name === "acf-fields") return true;
  if (index >= 5) return false;
  console.log(index);
  return findAcfParent(node?.parent, index + 1);
}

export function acffields(htmlInput) {
  const processNodeDefinitions = new ProcessNodeDefinitions();
  const processingInstructions = [
    {
      // ACF fields
      shouldProcessNode: (node) => node.name?.toLowerCase() === "acf-fields",
      processNode: (node, children) => {
        console.log("CHILDREN", children);
        return (
          <PanelBody
            title={__("ACF Fields Settings", "air-blocks")}
            initialOpen={true}
          >
            {...children}
          </PanelBody>
        );
      },
    },
    {
      shouldProcessNode: (node) => findAcfParent(node.parent),
      processNode: (node, children, param2) => {
        console.log("process", node);
        return processNodeDefinitions.processDefaultNode(
          node,
          children,
          param2
        );
      },
    },
  ];

  return htmlToReactParser.parseWithInstructions(
    htmlInput,
    () => true,
    processingInstructions
  );
}
