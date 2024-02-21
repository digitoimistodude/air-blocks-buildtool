<?php
/** WP Block Builder "framework" */
function register_attribute( $key, $name, $type, $default_value ) {}

global $get_attribute_local_scope;
$get_attribute_local_scope = function ( $key ) use ( $attributes ) {
  if ( ! isset( $attributes[ $key ] ) ) {
    return '';
  }
  return $attributes[ $key ];
};

function attr( $key ) {
  global $get_attribute_local_scope;
  return $get_attribute_local_scope( $key );
}
// End WP Block Builder "framework"

ob_start();
require_once 'block.php';
$html = ob_get_clean();

// Replace innerblocks
$html = preg_replace( '(<InnerBlocks.*\/{0,1}>)', $content, $html );

// Remove attributes
$html = preg_replace( '( wp-[a-z\-]*=".*")', '', $html );

// We're just parsing content coming from blocks, so no escaping is necessary.
echo $html; // phpcs:ignore
