<?php
/**
 * This runner is used to generate PHP for HTML attribute scanning
 * @package air-blocks-buildtool
 */

error_reporting( 0 ); // phpcs:ignore

$attributes = [];

function register_attribute( $key, $name, $type, $default_value ) {
  global $attributes;
  $attributes[ $key ] = $default_value;
}

function attr( $key ) {
  global $attributes;
  if ( ! isset( $attributes[ $key ] ) ) {
    return '';
  }
  return $attributes[ $key ];
}

require_once $argv[1];