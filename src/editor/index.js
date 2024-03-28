// Air Blocks' editor script entry point
const {
  useBlockProps,
  InspectorControls,
  InnerBlocks,
} = window.wp.blockEditor;
const {
  registerBlockType,
  __experimentalSanitizeBlockAttributes,
} = window.wp.blocks;
const apiFetch = window.wp.apiFetch;
const { addQueryArgs } = window.wp.url;
const {
  useState,
  useEffect,
  useRef,
  useMemo,
} = window.wp.element;
const { useDebounce } = window.wp.compose;
const {
  Spinner,
  TextControl,
  PanelBody,
  PanelRow,
  ToggleControl,
  SelectControl,
} = window.wp.components;
const { __ } = window.wp.i18n;

import bringHtmlToLife from "./html-parser";
import { getBlock } from './macro.js' with { type: 'macro' };

function rendererPath(block, attributes = null, urlQueryArgs = {}) {
  return addQueryArgs(`/wp/v2/block-renderer/${block}`, {
    context: "edit",
    ...(null !== attributes ? { attributes } : {}),
    ...urlQueryArgs,
  });
}
const name = getBlock();
registerBlockType(name, {
  edit: (props) => {
    const fetchRequestRef = useRef();
    const isMountedRef = useRef(true);
    const [response, setResponse] = useState(null);

    function fetchData() {
      let sanitizedAttributes =
        props.attributes &&
        __experimentalSanitizeBlockAttributes(name, props.attributes);

      const urlAttributes = sanitizedAttributes ?? null;
      const path = rendererPath(name, urlAttributes, undefined);
      const data = null;

      // Store the latest fetch request so that when we process it, we can
      // check if it is the current request, to avoid race conditions on slow networks.
      const fetchRequest = (fetchRequestRef.current = apiFetch({
        path,
        data,
        method: "GET",
      })
        .then((fetchResponse) => {
          if (
            isMountedRef.current &&
            fetchRequest === fetchRequestRef.current &&
            fetchResponse
          ) {
            setResponse(fetchResponse.rendered);
          }
        })
        .catch((error) => {
          if (
            isMountedRef.current &&
            fetchRequest === fetchRequestRef.current
          ) {
            setResponse({
              error: true,
              errorMsg: error.message,
            });
          }
        }));

      return fetchRequest;
    }

    const debouncedFetchData = useDebounce(fetchData, 500);
    const hasResponse = !!response;

    const sidebarAttributes = useMemo(() => {
      const block = wp.blocks.getBlockType(name);
      if (!block) return;
      return Object.keys(block.attributes)
        .map((i) => ({ name: i, ...(block.attributes[i]) }))
        .map((i) => ({
          name: i.name,
          value: props.attributes[i.name],
          ...i,
          ...props.attributes[i.name],
        }))
        .filter((i) => i["air-type"] === "sidebar");
    }, [props]);

    useEffect(() => {
      if (hasResponse) {
        debouncedFetchData();
      } else {
        fetchData();
      }
    }, [sidebarAttributes]); // Only on non-rich-text attributes

    const blockProps = useBlockProps({
      className: `air-block block-${name.split("/")[1]}`,
    });

    if (!hasResponse) {
      return (
        <div {...blockProps}>
          <Spinner />
        </div>
      );
    }

    if (response.error) {
      return <div {...blockProps}>Error: {response.errorMsg}</div>;
    }

    let serialized = bringHtmlToLife(
      response.trim(),
      props.attributes,
      props.setAttributes
    );

    // Sometimes newlines mess this up
    if (Array.isArray(serialized)) serialized = serialized[0];

    const element = window.React.cloneElement(serialized, {
      ...blockProps,
      className: `${blockProps.className} ${serialized?.props?.className ?? ''}`,
      children: [
        ...serialized.props.children,
        sidebarAttributes.length > 0 ? (
          <InspectorControls key={name}>
            <PanelBody
              title={__("Block Settings", "bodybuilder")}
              initialOpen={true}
            >
              {sidebarAttributes.map((attribute) => (
                <PanelRow key={attribute.name}>
                  <fieldset style={{ width: "100%" }} id={attribute.name}>
                    {attribute.type === "string" && !attribute.enum && (
                      <TextControl
                        label={__(
                          attribute["air-label"] || attribute.name,
                          "bodybuilder"
                        )}
                        value={props.attributes[attribute.name]}
                        onChange={(val) =>
                          props.setAttributes({ [attribute.name]: val })
                        }
                      />
                    )}
                    {attribute.type === "boolean" && (
                      <ToggleControl
                        label={__(
                          attribute["air-label"] || attribute.name,
                          "bodybuilder"
                        )}
                        checked={props.attributes[attribute.name]}
                        onChange={(val) =>
                          props.setAttributes({ [attribute.name]: val })
                        }
                      />
                    )}
                    {attribute.enum && (
                      <SelectControl
                        label={__(
                          attribute["air-label"] || attribute.name,
                          "bodybuilder"
                        )}
                        value={props.attributes[attribute.name]}
                        options={Object.keys(attribute["air-options"]).map(
                          (key) => ({
                            value: key,
                            label: attribute["air-options"][key],
                          })
                        )}
                        onChange={(val) =>
                          props.setAttributes({ [attribute.name]: val })
                        }
                      />
                    )}
                  </fieldset>
                </PanelRow>
              ))}
            </PanelBody>
          </InspectorControls>
        ) : (
          <></>
        ),
      ],
    });
    return element;
  },
  save: () => <InnerBlocks.Content />,
});
