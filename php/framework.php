<?php
/**
 * WP Block Builder "framework"
 * @package air-blocks
 */

global $get_attribute_local_scope;
$get_attribute_local_scope = function ( $key ) use ( $attributes ) {
  if ( ! isset( $attributes[ $key ] ) ) {
    return '';
  }
  return $attributes[ $key ];
};

if ( ! function_exists( 'register_attribute' ) ) {
  function register_attribute( $key, $name, $type, $default_value ) {}
}

if ( ! function_exists( 'attr' ) ) {
  function attr( $key ) {
    global $get_attribute_local_scope;
    return $get_attribute_local_scope( $key );
  }
}

// End WP Block Builder "framework"

ob_start();
require_once 'block.php';
$html = ob_get_clean();

$is_editor = defined( 'REST_REQUEST' ) && true === REST_REQUEST && 'edit' === filter_input( INPUT_GET, 'context', FILTER_SANITIZE_STRING );

if ( ! $is_editor ) {
  // Replace innerblocks
  $html = preg_replace( '(<InnerBlocks.*\/{0,1}>)', $content, $html );

  // Remove attributes
  $html = preg_replace( '( wp-[a-z\-]*=".*")', '', $html );
}

// We're just parsing content coming from blocks, so no escaping is necessary.
echo $html; // phpcs:ignore

if ( $is_editor && function_exists( 'acf_get_field_groups' ) ) {
  $acf_fields = [];
  $groups = acf_get_field_groups(
		[
			'air_block' => 'test',
    ]
	);

	// Loop over results and append fields.
	if ( $groups ) {
		foreach ( $groups as $field_group ) {
			$acf_fields = array_merge( $acf_fields, acf_get_fields( $field_group ) );
		}
	}


  echo '<acf-fields>';
    acf_render_fields( $acf_fields, 'air_block_test', 'div', 'field' );
  echo '</acf-fields>';
}